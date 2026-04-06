import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import {
  CameraProps,
  CameraRef,
  FacingMode,
  Stream,
  SetStream,
  SetNumberOfCameras,
  SetNotSupported,
  SetPermissionDenied,
  TakePhotoOptions,
} from './types';
import { Container, Wrapper, Canvas, Cam, ErrorMsg } from './styles';

const DEFAULT_ERROR_MESSAGES = {
  noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
  permissionDenied: 'Permission denied. Please refresh and give camera permission.',
  switchCamera:
    'It is not possible to switch camera to different one because there is only one video device accessible.',
  canvas: 'Canvas is not supported.',
};

export const Camera = React.forwardRef<CameraRef, CameraProps>(
  (
    {
      facingMode = 'user',
      aspectRatio = 'cover',
      numberOfCamerasCallback = () => null,
      videoSourceDeviceId = undefined,
      errorMessages: errorMessagesProp,
      videoReadyCallback = () => null,
      className,
      style,
      videoConstraints,
    },
    ref,
  ) => {
    const errorMessages = { ...DEFAULT_ERROR_MESSAGES, ...errorMessagesProp };
    const player = useRef<HTMLVideoElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const context = useRef<CanvasRenderingContext2D | null>(null);
    const container = useRef<HTMLDivElement>(null);
    const [numberOfCameras, setNumberOfCameras] = useState<number>(0);
    const [stream, setStream] = useState<Stream>(null);
    const [currentFacingMode, setFacingMode] = useState<FacingMode>(facingMode);
    const [notSupported, setNotSupported] = useState<boolean>(false);
    const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
    const [torchSupported, setTorchSupported] = useState<boolean>(false);
    const [torch, setTorch] = useState<boolean>(false);
    const mounted = useRef(false);

    useEffect(() => {
      mounted.current = true;

      return () => {
        mounted.current = false;
      };
    }, []);

    useEffect(() => {
      numberOfCamerasCallback(numberOfCameras);
    }, [numberOfCameras]);

    const switchTorch = async (on = false) => {
      if (stream && navigator?.mediaDevices && !!mounted.current) {
        const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
        const [track] = stream.getTracks();
        if (supportedConstraints && 'torch' in supportedConstraints && track) {
          try {
            await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
            return true;
          } catch {
            return false;
          }
        }
      }

      return false;
    };

    useEffect(() => {
      switchTorch(torch);
    }, [torch]);

    useImperativeHandle(ref, () => ({
      takePhoto: (typeOrOptions?: 'base64url' | 'imgData' | TakePhotoOptions): string | ImageData => {
        // Support both legacy string arg and new options object
        let type: 'base64url' | 'imgData' | undefined;
        let mirror = false;
        if (typeof typeOrOptions === 'object' && typeOrOptions !== null) {
          type = typeOrOptions.type;
          mirror = typeOrOptions.mirror ?? false;
        } else {
          type = typeOrOptions;
        }

        if (numberOfCameras < 1) {
          throw new Error(errorMessages.noCameraAccessible);
        }

        if (canvas?.current) {
          const playerWidth = player?.current?.videoWidth || 1280;
          const playerHeight = player?.current?.videoHeight || 720;
          const playerAR = playerWidth / playerHeight;

          const canvasWidth = container?.current?.offsetWidth || 1280;
          const canvasHeight = container?.current?.offsetHeight || 1280;
          const canvasAR = canvasWidth / canvasHeight;

          let sX, sY, sW, sH;

          if (playerAR > canvasAR) {
            sH = playerHeight;
            sW = playerHeight * canvasAR;
            sX = (playerWidth - sW) / 2;
            sY = 0;
          } else {
            sW = playerWidth;
            sH = playerWidth / canvasAR;
            sX = 0;
            sY = (playerHeight - sH) / 2;
          }

          canvas.current.width = sW;
          canvas.current.height = sH;

          if (!context.current) {
            context.current = canvas.current.getContext('2d', { willReadFrequently: true });
          }

          if (context.current && player?.current) {
            if (mirror) {
              context.current.save();
              context.current.scale(-1, 1);
              context.current.drawImage(player.current, sX, sY, sW, sH, -sW, 0, sW, sH);
              context.current.restore();
            } else {
              context.current.drawImage(player.current, sX, sY, sW, sH, 0, 0, sW, sH);
            }
          }

          if (type === 'imgData') {
            if (!context.current) {
              throw new Error(errorMessages.canvas);
            }
            return context.current.getImageData(0, 0, sW, sH);
          }

          return canvas.current.toDataURL('image/jpeg');
        } else {
          throw new Error(errorMessages.canvas);
        }
      },
      switchCamera: () => {
        if (numberOfCameras < 1) {
          throw new Error(errorMessages.noCameraAccessible);
        } else if (numberOfCameras < 2) {
          console.error('Error: Unable to switch camera. Only one device is accessible.'); // console only
        }
        const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacingMode);
        return newFacingMode;
      },
      getNumberOfCameras: () => {
        return numberOfCameras;
      },
      toggleTorch: () => {
        const torchVal = !torch;
        setTorch(torchVal);
        return torchVal;
      },
      torchSupported: torchSupported,
    }));

    useEffect(() => {
      initCameraStream(
        stream,
        setStream,
        currentFacingMode,
        videoSourceDeviceId,
        setNumberOfCameras,
        setNotSupported,
        setPermissionDenied,
        !!mounted.current,
        videoConstraints,
      );
    }, [currentFacingMode, videoSourceDeviceId]);

    useEffect(() => {
      switchTorch(false).then((success) => setTorchSupported(success));
      if (stream && player && player.current) {
        player.current.srcObject = stream;
      }
      return () => {
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        }
      };
    }, [stream]);

    return (
      <Container ref={container} $aspectRatio={aspectRatio} className={className} style={style}>
        <Wrapper>
          {notSupported ? <ErrorMsg>{errorMessages.noCameraAccessible}</ErrorMsg> : null}
          {permissionDenied ? <ErrorMsg>{errorMessages.permissionDenied}</ErrorMsg> : null}
          <Cam
            ref={player}
            id="video"
            muted={true}
            autoPlay={true}
            playsInline={true}
            $mirrored={currentFacingMode === 'user'}
            onLoadedData={() => {
              videoReadyCallback();
            }}
          ></Cam>
          <Canvas ref={canvas} />
        </Wrapper>
      </Container>
    );
  },
);

Camera.displayName = 'Camera';

const shouldSwitchToCamera = async (currentFacingMode: FacingMode): Promise<string | undefined> => {
  const cameras: string[] = [];
  if (currentFacingMode === 'environment') {
    await navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((i) => i.kind == 'videoinput');
      videoDevices.forEach((device) => {
        try {
          // getCapabilities() is not available on Firefox and iOS 15 Safari (fixes #75, #77)
          if (typeof (device as InputDeviceInfo).getCapabilities === 'function') {
            const capabilities = (device as InputDeviceInfo).getCapabilities();
            if (
              capabilities.facingMode &&
              capabilities.facingMode.indexOf('environment') >= 0 &&
              capabilities.deviceId
            ) {
              cameras.push(capabilities.deviceId);
            }
          }
        } catch (err) {
          // getCapabilities() may throw on certain browsers (e.g. Firefox, iOS 15 Safari)
          console.warn(
            `[react-webcam-pro] getCapabilities() not supported for device "${device.label || device.deviceId}". ` +
              `Camera will still work, but automatic environment camera detection is skipped for this device.`,
            err,
          );
        }
      });
    });
  }

  if (cameras.length > 1) {
    return cameras.pop();
  }

  return undefined;
};

const initCameraStream = async (
  stream: Stream,
  setStream: SetStream,
  currentFacingMode: FacingMode,
  videoSourceDeviceId: string | undefined,
  setNumberOfCameras: SetNumberOfCameras,
  setNotSupported: SetNotSupported,
  setPermissionDenied: SetPermissionDenied,
  isMounted: boolean,
  videoConstraints?: MediaTrackConstraints,
) => {
  // stop any active streams in the window
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  // If a specific device ID is provided, always use it (fixes #62, #69)
  let cameraDeviceId;
  if (videoSourceDeviceId) {
    cameraDeviceId = { exact: videoSourceDeviceId };
  } else {
    // Only auto-detect environment camera when no specific device is requested
    const switchToCamera = await shouldSwitchToCamera(currentFacingMode);
    if (switchToCamera) {
      cameraDeviceId = switchToCamera;
    }
  }

  const constraints: MediaStreamConstraints = {
    audio: false,
    video: {
      deviceId: cameraDeviceId,
      facingMode: currentFacingMode,
      ...videoConstraints,
    },
  };

  if (navigator?.mediaDevices?.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (isMounted) {
          setStream(handleSuccess(stream, setNumberOfCameras));
        }
      })
      .catch((err) => {
        handleError(err, setNotSupported, setPermissionDenied);
      });
  } else {
    setNotSupported(true);
  }
};

const handleSuccess = (stream: MediaStream, setNumberOfCameras: SetNumberOfCameras) => {
  navigator.mediaDevices
    .enumerateDevices()
    .then((r) => setNumberOfCameras(r.filter((i) => i.kind === 'videoinput').length));

  return stream;
};

const handleError = (error: Error, setNotSupported: SetNotSupported, setPermissionDenied: SetPermissionDenied) => {
  console.error(error);

  //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  if (error.name === 'PermissionDeniedError') {
    setPermissionDenied(true);
  } else {
    setNotSupported(true);
  }
};
