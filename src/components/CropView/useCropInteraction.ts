import { useRef, useCallback, useEffect } from 'react';
import { CropArea, HandlePosition, InteractionMode } from './CropView.types';
import { moveCrop, resizeCropFromHandle } from './cropUtils';

interface UseCropInteractionOptions {
  cropArea: CropArea;
  onCropChange: (newCrop: CropArea) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  aspectRatio?: number;
  minCropSize: number;
}

interface UseCropInteractionReturn {
  handlePointerDownOnCrop: (e: React.PointerEvent) => void;
  handlePointerDownOnHandle: (handle: HandlePosition) => (e: React.PointerEvent) => void;
}

/**
 * Custom hook that manages all pointer interactions for the crop box:
 * - Dragging the box to reposition
 * - Dragging corner/edge handles to resize
 *
 * Uses Pointer Events (unified mouse + touch + pen) for cross-platform support.
 */
export function useCropInteraction({
  cropArea,
  onCropChange,
  containerRef,
  aspectRatio,
  minCropSize,
}: UseCropInteractionOptions): UseCropInteractionReturn {
  const interactionRef = useRef<InteractionMode>({ type: 'idle' });

  /**
   * Convert a pointer event's page coordinates to fractional (0–1) coordinates
   * relative to the container.
   */
  const toFractional = useCallback(
    (pageX: number, pageY: number): { fx: number; fy: number } => {
      const el = containerRef.current;
      if (!el) return { fx: 0, fy: 0 };
      const rect = el.getBoundingClientRect();
      return {
        fx: (pageX - rect.left) / rect.width,
        fy: (pageY - rect.top) / rect.height,
      };
    },
    [containerRef],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const interaction = interactionRef.current;
      if (interaction.type === 'idle') return;

      e.preventDefault();
      const { fx, fy } = toFractional(e.clientX, e.clientY);

      if (interaction.type === 'move') {
        const deltaX = fx - interaction.startX;
        const deltaY = fy - interaction.startY;
        const newCrop = moveCrop(interaction.startCrop, deltaX, deltaY);
        onCropChange(newCrop);
      } else if (interaction.type === 'resize') {
        const deltaX = fx - interaction.startX;
        const deltaY = fy - interaction.startY;
        const newCrop = resizeCropFromHandle(
          interaction.startCrop,
          interaction.handle,
          deltaX,
          deltaY,
          aspectRatio,
          minCropSize,
        );
        onCropChange(newCrop);
      }
    },
    [toFractional, onCropChange, aspectRatio, minCropSize],
  );

  const handlePointerUp = useCallback(() => {
    interactionRef.current = { type: 'idle' };
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const startInteraction = useCallback(
    (e: React.PointerEvent, mode: InteractionMode) => {
      e.preventDefault();
      e.stopPropagation();
      interactionRef.current = mode;
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  const handlePointerDownOnCrop = useCallback(
    (e: React.PointerEvent) => {
      // Only primary button (left click or single touch)
      if (e.button !== 0) return;
      const { fx, fy } = toFractional(e.clientX, e.clientY);
      startInteraction(e, {
        type: 'move',
        startX: fx,
        startY: fy,
        startCrop: { ...cropArea },
      });
    },
    [cropArea, toFractional, startInteraction],
  );

  const handlePointerDownOnHandle = useCallback(
    (handle: HandlePosition) => (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const { fx, fy } = toFractional(e.clientX, e.clientY);
      startInteraction(e, {
        type: 'resize',
        handle,
        startX: fx,
        startY: fy,
        startCrop: { ...cropArea },
      });
    },
    [cropArea, toFractional, startInteraction],
  );

  return {
    handlePointerDownOnCrop,
    handlePointerDownOnHandle,
  };
}
