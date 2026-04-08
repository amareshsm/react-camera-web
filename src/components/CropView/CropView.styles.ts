import styled from 'styled-components';

/** Outermost container — fills its parent, acts as the crop viewport */
export const CropContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
  user-select: none;
  touch-action: none;
  -webkit-user-select: none;
  display: flex;
  flex-direction: column;
`;

/** Area that holds the image + overlay, grows to fill available space */
export const CropWorkspace = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/** The source image being cropped */
export const CropImage = styled.img`
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
`;

/**
 * SVG overlay that darkens the area outside the crop box.
 * Positioned absolutely over the image.
 */
export const CropOverlay = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

/** The draggable crop box region */
export const CropBox = styled.div<{ $isCircle: boolean }>`
  position: absolute;
  border: 2px solid #fff;
  cursor: move;
  box-sizing: border-box;
  ${({ $isCircle }) => $isCircle && 'border-radius: 50%;'}

  /* Rule-of-thirds grid */
  &::before,
  &::after {
    content: '';
    position: absolute;
    pointer-events: none;
  }

  &::before {
    top: 33.33%;
    left: 0;
    right: 0;
    height: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 calc(100% / 3 * 1) 0 0 rgba(255, 255, 255, 0.3);
  }

  &::after {
    left: 33.33%;
    top: 0;
    bottom: 0;
    width: 0;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: calc(100% / 3 * 1) 0 0 0 rgba(255, 255, 255, 0.3);
  }
`;

/** Corner resize handle */
export const CornerHandle = styled.div<{ $position: string }>`
  position: absolute;
  width: 24px;
  height: 24px;
  z-index: 2;

  ${({ $position }) => {
    switch ($position) {
      case 'top-left':
        return 'top: -2px; left: -2px; cursor: nwse-resize;';
      case 'top-right':
        return 'top: -2px; right: -2px; cursor: nesw-resize;';
      case 'bottom-left':
        return 'bottom: -2px; left: -2px; cursor: nesw-resize;';
      case 'bottom-right':
        return 'bottom: -2px; right: -2px; cursor: nwse-resize;';
      default:
        return '';
    }
  }}

  /* L-shaped corner bracket */
  &::before,
  &::after {
    content: '';
    position: absolute;
    background: #fff;
  }

  ${({ $position }) => {
    const isTop = $position.includes('top');
    const isLeft = $position.includes('left');
    return `
      &::before {
        ${isTop ? 'top: 0;' : 'bottom: 0;'}
        ${isLeft ? 'left: 0;' : 'right: 0;'}
        width: 3px;
        height: 16px;
      }
      &::after {
        ${isTop ? 'top: 0;' : 'bottom: 0;'}
        ${isLeft ? 'left: 0;' : 'right: 0;'}
        width: 16px;
        height: 3px;
      }
    `;
  }}
`;

/** Edge resize handle */
export const EdgeHandle = styled.div<{ $position: string }>`
  position: absolute;
  z-index: 1;

  ${({ $position }) => {
    switch ($position) {
      case 'top':
        return 'top: -4px; left: 20%; right: 20%; height: 8px; cursor: ns-resize;';
      case 'bottom':
        return 'bottom: -4px; left: 20%; right: 20%; height: 8px; cursor: ns-resize;';
      case 'left':
        return 'left: -4px; top: 20%; bottom: 20%; width: 8px; cursor: ew-resize;';
      case 'right':
        return 'right: -4px; top: 20%; bottom: 20%; width: 8px; cursor: ew-resize;';
      default:
        return '';
    }
  }}
`;

/** Bottom toolbar for Crop/Cancel/Reset buttons */
export const CropToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.85);
  gap: 12px;
  flex-shrink: 0;
`;

/** Base button style for crop toolbar */
const ToolbarButton = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  border: none;
  outline: none;

  &:active {
    opacity: 0.8;
  }
`;

export const ConfirmButton = styled(ToolbarButton)`
  background: #4caf50;
  color: #fff;

  &:hover {
    background: #43a047;
  }
`;

export const CancelButton = styled(ToolbarButton)`
  background: transparent;
  color: #e8e8e8;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const ResetButton = styled(ToolbarButton)`
  background: transparent;
  color: #aaa;
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 13px;
  padding: 8px 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ccc;
  }
`;
