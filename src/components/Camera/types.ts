export type FacingMode = 'user' | 'environment';
export type AspectRatio = 'cover' | number; // for example 16/9, 4/3, 1/1
export type Stream = MediaStream | null;
export type SetStream = React.Dispatch<React.SetStateAction<Stream>>;
export type SetNumberOfCameras = React.Dispatch<React.SetStateAction<number>>;
export type SetNotSupported = React.Dispatch<React.SetStateAction<boolean>>;
export type SetPermissionDenied = React.Dispatch<React.SetStateAction<boolean>>;

export interface ErrorMessages {
  noCameraAccessible?: string;
  permissionDenied?: string;
  switchCamera?: string;
  canvas?: string;
}

export interface CameraProps {
  facingMode?: FacingMode;
  aspectRatio?: AspectRatio;
  numberOfCamerasCallback?(numberOfCameras: number): void;
  videoSourceDeviceId?: string | undefined;
  errorMessages?: ErrorMessages;
  videoReadyCallback?(): void;
  className?: string;
  style?: React.CSSProperties;
}

export interface CameraRef {
  takePhoto(type?: 'base64url' | 'imgData'): string | ImageData;
  switchCamera(): FacingMode;
  getNumberOfCameras(): number;
  toggleTorch(): boolean;
  torchSupported: boolean;
}

/**
 * @deprecated Use `CameraRef` for typing refs (e.g. `useRef<CameraRef>(null)`).
 * `CameraType` is kept for backward compatibility with react-camera-pro.
 */
export type CameraType = CameraRef;
