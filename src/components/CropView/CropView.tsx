import React, { useState, useRef, useCallback, useImperativeHandle, useEffect } from 'react';
import { CropViewProps, CropViewRef, CropArea, HandlePosition } from './CropView.types';
import { getInitialCropArea, extractCroppedImage, clampCropArea } from './cropUtils';
import { useCropInteraction } from './useCropInteraction';
import {
  CropContainer,
  CropWorkspace,
  CropImage,
  CropOverlay,
  CropBox,
  CornerHandle,
  EdgeHandle,
  CropToolbar,
  ConfirmButton,
  CancelButton,
  ResetButton,
} from './CropView.styles';

const CORNER_HANDLES: HandlePosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
const EDGE_HANDLES: HandlePosition[] = ['top', 'right', 'bottom', 'left'];

export const CropView = React.forwardRef<CropViewRef, CropViewProps>(
  (
    {
      image,
      cropAspectRatio,
      cropShape = 'rect',
      minCropSize = 0.1,
      onCropComplete,
      onCropCancel,
      labels,
      className,
      style,
    },
    ref,
  ) => {
    const confirmLabel = labels?.confirm ?? 'Crop';
    const cancelLabel = labels?.cancel ?? 'Cancel';
    const resetLabel = labels?.reset ?? 'Reset';

    const [cropArea, setCropArea] = useState<CropArea>(() => getInitialCropArea(cropAspectRatio));
    const [imageLoaded, setImageLoaded] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Recompute initial crop when aspect ratio prop changes
    useEffect(() => {
      setCropArea(getInitialCropArea(cropAspectRatio));
    }, [cropAspectRatio]);

    const handleCropChange = useCallback(
      (newCrop: CropArea) => {
        setCropArea(clampCropArea(newCrop, minCropSize));
      },
      [minCropSize],
    );

    const { handlePointerDownOnCrop, handlePointerDownOnHandle } = useCropInteraction({
      cropArea,
      onCropChange: handleCropChange,
      containerRef: workspaceRef,
      aspectRatio: cropAspectRatio,
      minCropSize,
    });

    const doCrop = useCallback((): ReturnType<CropViewRef['cropImage']> => {
      if (!imageRef.current) {
        throw new Error('Image has not loaded yet.');
      }
      return extractCroppedImage(imageRef.current, cropArea);
    }, [cropArea]);

    const doReset = useCallback(() => {
      setCropArea(getInitialCropArea(cropAspectRatio));
    }, [cropAspectRatio]);

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      cropImage: doCrop,
      resetCrop: doReset,
      getCropArea: () => ({ ...cropArea }),
    }));

    const handleConfirm = useCallback(() => {
      const result = doCrop();
      onCropComplete(result);
    }, [doCrop, onCropComplete]);

    const handleCancel = useCallback(() => {
      onCropCancel?.();
    }, [onCropCancel]);

    /**
     * Calculate the crop box pixel position relative to the displayed image
     * within the workspace. The image uses object-fit: contain, so we need
     * to figure out where the image actually renders.
     */
    const getCropBoxStyle = useCallback((): React.CSSProperties => {
      if (!workspaceRef.current || !imageRef.current || !imageLoaded) {
        return { display: 'none' };
      }

      const workspace = workspaceRef.current.getBoundingClientRect();
      const img = imageRef.current;

      // Calculate the rendered image dimensions (object-fit: contain)
      const imgNaturalAR = img.naturalWidth / img.naturalHeight;
      const workspaceAR = workspace.width / workspace.height;

      let renderedW: number;
      let renderedH: number;

      if (imgNaturalAR > workspaceAR) {
        renderedW = workspace.width;
        renderedH = workspace.width / imgNaturalAR;
      } else {
        renderedH = workspace.height;
        renderedW = workspace.height * imgNaturalAR;
      }

      const offsetX = (workspace.width - renderedW) / 2;
      const offsetY = (workspace.height - renderedH) / 2;

      return {
        left: offsetX + cropArea.x * renderedW,
        top: offsetY + cropArea.y * renderedH,
        width: cropArea.width * renderedW,
        height: cropArea.height * renderedH,
      };
    }, [cropArea, imageLoaded]);

    /**
     * Get the rendered image position and size within the workspace,
     * used for the overlay SVG mask.
     */
    const getImageRect = useCallback(() => {
      if (!workspaceRef.current || !imageRef.current || !imageLoaded) {
        return null;
      }

      const workspace = workspaceRef.current.getBoundingClientRect();
      const img = imageRef.current;
      const imgNaturalAR = img.naturalWidth / img.naturalHeight;
      const workspaceAR = workspace.width / workspace.height;

      let renderedW: number;
      let renderedH: number;

      if (imgNaturalAR > workspaceAR) {
        renderedW = workspace.width;
        renderedH = workspace.width / imgNaturalAR;
      } else {
        renderedH = workspace.height;
        renderedW = workspace.height * imgNaturalAR;
      }

      const offsetX = (workspace.width - renderedW) / 2;
      const offsetY = (workspace.height - renderedH) / 2;

      return { offsetX, offsetY, renderedW, renderedH, workspaceW: workspace.width, workspaceH: workspace.height };
    }, [imageLoaded]);

    // Force re-render on resize to recompute positions
    const [, setRenderKey] = useState(0);
    useEffect(() => {
      const onResize = () => setRenderKey((k) => k + 1);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);

    const cropBoxStyle = getCropBoxStyle();
    const imageRect = getImageRect();

    // Compute the overlay clip path to darken outside the crop area
    const renderOverlay = () => {
      if (!imageRect) return null;
      const { offsetX, offsetY, renderedW, renderedH, workspaceW, workspaceH } = imageRect;

      // The crop box absolute position within the workspace
      const cx = offsetX + cropArea.x * renderedW;
      const cy = offsetY + cropArea.y * renderedH;
      const cw = cropArea.width * renderedW;
      const ch = cropArea.height * renderedH;

      const isCircle = cropShape === 'circle';

      return (
        <CropOverlay viewBox={`0 0 ${workspaceW} ${workspaceH}`} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="crop-mask">
              <rect x="0" y="0" width={workspaceW} height={workspaceH} fill="white" />
              {isCircle ? (
                <ellipse cx={cx + cw / 2} cy={cy + ch / 2} rx={cw / 2} ry={ch / 2} fill="black" />
              ) : (
                <rect x={cx} y={cy} width={cw} height={ch} fill="black" />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width={workspaceW}
            height={workspaceH}
            fill="rgba(0, 0, 0, 0.55)"
            mask="url(#crop-mask)"
          />
        </CropOverlay>
      );
    };

    return (
      <CropContainer ref={containerRef} className={className} style={style}>
        <CropWorkspace ref={workspaceRef}>
          <CropImage
            ref={imageRef}
            src={image}
            alt="Crop source"
            onLoad={() => setImageLoaded(true)}
            draggable={false}
          />

          {imageLoaded && renderOverlay()}

          {imageLoaded && (
            <CropBox
              style={cropBoxStyle}
              $isCircle={cropShape === 'circle'}
              onPointerDown={handlePointerDownOnCrop}
            >
              {/* Corner handles */}
              {CORNER_HANDLES.map((pos) => (
                <CornerHandle key={pos} $position={pos} onPointerDown={handlePointerDownOnHandle(pos)} />
              ))}

              {/* Edge handles */}
              {EDGE_HANDLES.map((pos) => (
                <EdgeHandle key={pos} $position={pos} onPointerDown={handlePointerDownOnHandle(pos)} />
              ))}
            </CropBox>
          )}
        </CropWorkspace>

        <CropToolbar>
          <CancelButton type="button" onClick={handleCancel}>
            {cancelLabel}
          </CancelButton>
          <ResetButton type="button" onClick={doReset}>
            {resetLabel}
          </ResetButton>
          <ConfirmButton type="button" onClick={handleConfirm}>
            {confirmLabel}
          </ConfirmButton>
        </CropToolbar>
      </CropContainer>
    );
  },
);

CropView.displayName = 'CropView';
