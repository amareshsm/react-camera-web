import { CropArea, CropResult, HandlePosition } from './CropView.types';

/**
 * Clamp a crop area so it stays within the 0–1 bounds and respects minimum size.
 */
export function clampCropArea(crop: CropArea, minSize: number): CropArea {
  const min = Math.max(minSize, 0.01);
  let { x, y, width, height } = crop;

  // Enforce minimum dimensions
  width = Math.max(width, min);
  height = Math.max(height, min);

  // Clamp to 0–1 bounds
  width = Math.min(width, 1);
  height = Math.min(height, 1);
  x = Math.max(0, Math.min(x, 1 - width));
  y = Math.max(0, Math.min(y, 1 - height));

  return { x, y, width, height };
}

/**
 * Move the crop area by a delta (in fractional units), clamped to image bounds.
 */
export function moveCrop(crop: CropArea, deltaX: number, deltaY: number): CropArea {
  return clampCropArea(
    {
      x: crop.x + deltaX,
      y: crop.y + deltaY,
      width: crop.width,
      height: crop.height,
    },
    0,
  );
}

/**
 * Resize the crop area from a specific handle, respecting optional aspect ratio lock.
 */
export function resizeCropFromHandle(
  startCrop: CropArea,
  handle: HandlePosition,
  deltaX: number,
  deltaY: number,
  aspectRatio: number | undefined,
  minSize: number,
): CropArea {
  let { x, y, width, height } = startCrop;

  switch (handle) {
    case 'top-left':
      x += deltaX;
      y += deltaY;
      width -= deltaX;
      height -= deltaY;
      break;
    case 'top-right':
      y += deltaY;
      width += deltaX;
      height -= deltaY;
      break;
    case 'bottom-left':
      x += deltaX;
      width -= deltaX;
      height += deltaY;
      break;
    case 'bottom-right':
      width += deltaX;
      height += deltaY;
      break;
    case 'top':
      y += deltaY;
      height -= deltaY;
      break;
    case 'bottom':
      height += deltaY;
      break;
    case 'left':
      x += deltaX;
      width -= deltaX;
      break;
    case 'right':
      width += deltaX;
      break;
  }

  // Enforce minimum
  if (width < minSize) {
    if (handle.includes('left')) {
      x = startCrop.x + startCrop.width - minSize;
    }
    width = minSize;
  }
  if (height < minSize) {
    if (handle.includes('top')) {
      y = startCrop.y + startCrop.height - minSize;
    }
    height = minSize;
  }

  // Enforce aspect ratio
  if (aspectRatio !== undefined && aspectRatio > 0) {
    // Calculate based on the dominant axis of movement
    const isHorizontalHandle = handle === 'left' || handle === 'right';
    const isVerticalHandle = handle === 'top' || handle === 'bottom';

    if (isHorizontalHandle) {
      height = width / aspectRatio;
    } else if (isVerticalHandle) {
      width = height * aspectRatio;
    } else {
      // Corner handle: use the axis with the larger delta
      if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        height = width / aspectRatio;
      } else {
        width = height * aspectRatio;
      }
    }

    // Re-enforce minimum after aspect ratio correction
    if (width < minSize) {
      width = minSize;
      height = width / aspectRatio;
    }
    if (height < minSize) {
      height = minSize;
      width = height * aspectRatio;
    }
  }

  return clampCropArea({ x, y, width, height }, minSize);
}

/**
 * Get the initial crop area. If an aspect ratio is specified, center a crop box
 * that fits within the image. Otherwise, use the full image.
 */
export function getInitialCropArea(aspectRatio?: number): CropArea {
  if (aspectRatio !== undefined && aspectRatio > 0) {
    // Fit the largest rectangle with the given aspect ratio inside a 1×1 square
    // (since we're working in fractional coordinates, image is always 1×1)
    let width: number;
    let height: number;

    if (aspectRatio >= 1) {
      // Wider than tall — constrain by width
      width = 0.8;
      height = width / aspectRatio;
      if (height > 0.8) {
        height = 0.8;
        width = height * aspectRatio;
      }
    } else {
      // Taller than wide — constrain by height
      height = 0.8;
      width = height * aspectRatio;
      if (width > 0.8) {
        width = 0.8;
        height = width / aspectRatio;
      }
    }

    return {
      x: (1 - width) / 2,
      y: (1 - height) / 2,
      width,
      height,
    };
  }

  // Default: 80% centered
  return { x: 0.1, y: 0.1, width: 0.8, height: 0.8 };
}

/**
 * Extract a cropped region from an image using the Canvas API.
 * Returns both base64 and ImageData.
 */
export function extractCroppedImage(
  imageElement: HTMLImageElement,
  cropArea: CropArea,
): CropResult {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context is not available.');
  }

  const naturalWidth = imageElement.naturalWidth;
  const naturalHeight = imageElement.naturalHeight;

  // Convert fractional crop to pixel values
  const sx = Math.round(cropArea.x * naturalWidth);
  const sy = Math.round(cropArea.y * naturalHeight);
  const sw = Math.round(cropArea.width * naturalWidth);
  const sh = Math.round(cropArea.height * naturalHeight);

  canvas.width = sw;
  canvas.height = sh;

  ctx.drawImage(imageElement, sx, sy, sw, sh, 0, 0, sw, sh);

  const base64 = canvas.toDataURL('image/jpeg');
  const imgData = ctx.getImageData(0, 0, sw, sh);

  return {
    base64,
    imgData,
    cropArea,
  };
}
