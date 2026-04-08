import React from 'react';

/**
 * Represents the crop area coordinates and dimensions,
 * expressed as fractions (0–1) relative to the image's natural size.
 */
export interface CropArea {
  /** Left offset as a fraction of image width (0–1) */
  x: number;
  /** Top offset as a fraction of image height (0–1) */
  y: number;
  /** Width as a fraction of image width (0–1) */
  width: number;
  /** Height as a fraction of image height (0–1) */
  height: number;
}

/**
 * The result returned when a crop is confirmed.
 */
export interface CropResult {
  /** Cropped image as a base64 JPEG data URL */
  base64: string;
  /** Cropped image as raw ImageData */
  imgData: ImageData;
  /** The crop area used (fractions relative to the original image) */
  cropArea: CropArea;
}

/**
 * Props for the CropView component.
 */
export interface CropViewProps {
  /** The image to crop — a base64 data URL string (e.g. from `takePhoto()`) */
  image: string;

  /** Lock the crop box to a specific aspect ratio (e.g. `1` for square, `16/9`). Free-form if omitted. */
  cropAspectRatio?: number;

  /** Visual crop shape. `'circle'` renders a circular mask but still outputs a rectangular crop. Default: `'rect'` */
  cropShape?: 'rect' | 'circle';

  /** Minimum crop size as a fraction of the shorter image dimension. Default: `0.1` (10%) */
  minCropSize?: number;

  /** Called when the user confirms the crop */
  onCropComplete: (result: CropResult) => void;

  /** Called when the user cancels the crop */
  onCropCancel?: () => void;

  /** Custom labels for the confirm/cancel buttons */
  labels?: {
    confirm?: string;
    cancel?: string;
    reset?: string;
  };

  /** CSS class name for the outermost crop container */
  className?: string;

  /** Inline styles for the outermost crop container */
  style?: React.CSSProperties;
}

/**
 * Imperative handle exposed via ref on the CropView component.
 */
export interface CropViewRef {
  /** Programmatically trigger the crop and get the result */
  cropImage: () => CropResult;

  /** Reset crop area to full image */
  resetCrop: () => void;

  /** Get the current crop area (fractions relative to image) */
  getCropArea: () => CropArea;
}

/**
 * Which handle/edge the user is interacting with during a resize.
 */
export type HandlePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left';

/**
 * The current interaction state tracked by useCropInteraction.
 */
export type InteractionMode =
  | { type: 'idle' }
  | { type: 'move'; startX: number; startY: number; startCrop: CropArea }
  | { type: 'resize'; handle: HandlePosition; startX: number; startY: number; startCrop: CropArea };
