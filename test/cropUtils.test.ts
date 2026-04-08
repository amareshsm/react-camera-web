import {
  clampCropArea,
  moveCrop,
  resizeCropFromHandle,
  getInitialCropArea,
} from '../src/components/CropView/cropUtils';
import { CropArea } from '../src/components/CropView/CropView.types';

describe('cropUtils', () => {
  describe('clampCropArea', () => {
    it('should return crop unchanged if already valid', () => {
      const crop: CropArea = { x: 0.1, y: 0.2, width: 0.5, height: 0.4 };
      expect(clampCropArea(crop, 0.05)).toEqual(crop);
    });

    it('should clamp x to keep crop within bounds', () => {
      const crop: CropArea = { x: -0.1, y: 0.2, width: 0.5, height: 0.4 };
      const result = clampCropArea(crop, 0.05);
      expect(result.x).toBe(0);
    });

    it('should clamp x when crop extends beyond right edge', () => {
      const crop: CropArea = { x: 0.8, y: 0.2, width: 0.5, height: 0.4 };
      const result = clampCropArea(crop, 0.05);
      expect(result.x).toBe(0.5); // 1 - 0.5 = 0.5
    });

    it('should clamp y to keep crop within bounds', () => {
      const crop: CropArea = { x: 0.1, y: -0.2, width: 0.5, height: 0.4 };
      const result = clampCropArea(crop, 0.05);
      expect(result.y).toBe(0);
    });

    it('should clamp y when crop extends beyond bottom edge', () => {
      const crop: CropArea = { x: 0.1, y: 0.9, width: 0.5, height: 0.4 };
      const result = clampCropArea(crop, 0.05);
      expect(result.y).toBe(0.6); // 1 - 0.4 = 0.6
    });

    it('should enforce minimum width', () => {
      const crop: CropArea = { x: 0.5, y: 0.5, width: 0.01, height: 0.5 };
      const result = clampCropArea(crop, 0.1);
      expect(result.width).toBe(0.1);
    });

    it('should enforce minimum height', () => {
      const crop: CropArea = { x: 0.5, y: 0.5, width: 0.5, height: 0.01 };
      const result = clampCropArea(crop, 0.1);
      expect(result.height).toBe(0.1);
    });

    it('should clamp width to 1', () => {
      const crop: CropArea = { x: 0, y: 0, width: 1.5, height: 0.5 };
      const result = clampCropArea(crop, 0.05);
      expect(result.width).toBe(1);
    });

    it('should clamp height to 1', () => {
      const crop: CropArea = { x: 0, y: 0, width: 0.5, height: 1.5 };
      const result = clampCropArea(crop, 0.05);
      expect(result.height).toBe(1);
    });

    it('should handle all values out of bounds', () => {
      const crop: CropArea = { x: -1, y: -1, width: 5, height: 5 };
      const result = clampCropArea(crop, 0.05);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.width).toBe(1);
      expect(result.height).toBe(1);
    });

    it('should use 0.01 as absolute minimum when minSize is 0', () => {
      const crop: CropArea = { x: 0, y: 0, width: 0.001, height: 0.001 };
      const result = clampCropArea(crop, 0);
      expect(result.width).toBe(0.01);
      expect(result.height).toBe(0.01);
    });
  });

  describe('moveCrop', () => {
    it('should move crop by the given delta', () => {
      const crop: CropArea = { x: 0.2, y: 0.3, width: 0.4, height: 0.3 };
      const result = moveCrop(crop, 0.1, 0.05);
      expect(result.x).toBeCloseTo(0.3);
      expect(result.y).toBeCloseTo(0.35);
      expect(result.width).toBe(0.4);
      expect(result.height).toBe(0.3);
    });

    it('should clamp movement to prevent going out of bounds (right)', () => {
      const crop: CropArea = { x: 0.5, y: 0.3, width: 0.4, height: 0.3 };
      const result = moveCrop(crop, 0.5, 0);
      expect(result.x).toBe(0.6); // 1 - 0.4 = 0.6
    });

    it('should clamp movement to prevent going out of bounds (left)', () => {
      const crop: CropArea = { x: 0.2, y: 0.3, width: 0.4, height: 0.3 };
      const result = moveCrop(crop, -0.5, 0);
      expect(result.x).toBe(0);
    });

    it('should clamp movement to prevent going out of bounds (bottom)', () => {
      const crop: CropArea = { x: 0.2, y: 0.5, width: 0.4, height: 0.4 };
      const result = moveCrop(crop, 0, 0.5);
      expect(result.y).toBe(0.6); // 1 - 0.4 = 0.6
    });

    it('should clamp movement to prevent going out of bounds (top)', () => {
      const crop: CropArea = { x: 0.2, y: 0.1, width: 0.4, height: 0.3 };
      const result = moveCrop(crop, 0, -0.5);
      expect(result.y).toBe(0);
    });

    it('should not change dimensions during move', () => {
      const crop: CropArea = { x: 0.2, y: 0.2, width: 0.3, height: 0.4 };
      const result = moveCrop(crop, 0.05, 0.05);
      expect(result.width).toBe(0.3);
      expect(result.height).toBe(0.4);
    });
  });

  describe('resizeCropFromHandle', () => {
    const minSize = 0.05;

    it('should resize from bottom-right handle', () => {
      const crop: CropArea = { x: 0.1, y: 0.1, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'bottom-right', 0.1, 0.1, undefined, minSize);
      expect(result.width).toBeCloseTo(0.5);
      expect(result.height).toBeCloseTo(0.5);
      expect(result.x).toBeCloseTo(0.1);
      expect(result.y).toBeCloseTo(0.1);
    });

    it('should resize from top-left handle', () => {
      const crop: CropArea = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'top-left', 0.05, 0.05, undefined, minSize);
      expect(result.x).toBeCloseTo(0.25);
      expect(result.y).toBeCloseTo(0.25);
      expect(result.width).toBeCloseTo(0.35);
      expect(result.height).toBeCloseTo(0.35);
    });

    it('should resize from top-right handle', () => {
      const crop: CropArea = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'top-right', 0.1, -0.1, undefined, minSize);
      expect(result.width).toBeCloseTo(0.5);
      expect(result.y).toBeCloseTo(0.1);
      expect(result.height).toBeCloseTo(0.5);
    });

    it('should resize from bottom-left handle', () => {
      const crop: CropArea = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'bottom-left', -0.1, 0.1, undefined, minSize);
      expect(result.x).toBeCloseTo(0.1);
      expect(result.width).toBeCloseTo(0.5);
      expect(result.height).toBeCloseTo(0.5);
    });

    it('should resize from right edge', () => {
      const crop: CropArea = { x: 0.1, y: 0.1, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'right', 0.1, 0, undefined, minSize);
      expect(result.width).toBeCloseTo(0.5);
      expect(result.height).toBe(0.4);
    });

    it('should resize from bottom edge', () => {
      const crop: CropArea = { x: 0.1, y: 0.1, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'bottom', 0, 0.1, undefined, minSize);
      expect(result.height).toBeCloseTo(0.5);
      expect(result.width).toBe(0.4);
    });

    it('should resize from left edge', () => {
      const crop: CropArea = { x: 0.2, y: 0.1, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'left', -0.1, 0, undefined, minSize);
      expect(result.x).toBeCloseTo(0.1);
      expect(result.width).toBeCloseTo(0.5);
    });

    it('should resize from top edge', () => {
      const crop: CropArea = { x: 0.1, y: 0.2, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'top', 0, -0.1, undefined, minSize);
      expect(result.y).toBeCloseTo(0.1);
      expect(result.height).toBeCloseTo(0.5);
    });

    it('should not shrink below minSize', () => {
      const crop: CropArea = { x: 0.1, y: 0.1, width: 0.2, height: 0.2 };
      const result = resizeCropFromHandle(crop, 'bottom-right', -0.5, -0.5, undefined, minSize);
      expect(result.width).toBeGreaterThanOrEqual(minSize);
      expect(result.height).toBeGreaterThanOrEqual(minSize);
    });

    it('should enforce aspect ratio when resizing from bottom-right', () => {
      const crop: CropArea = { x: 0.1, y: 0.1, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'bottom-right', 0.2, 0.05, 1, minSize);
      // With aspect ratio 1:1, width and height should be equal
      expect(result.width).toBeCloseTo(result.height, 1);
    });

    it('should enforce aspect ratio when resizing from right edge', () => {
      const crop: CropArea = { x: 0.1, y: 0.1, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'right', 0.1, 0, 2, minSize);
      // aspectRatio = 2, so width should be 2 * height
      expect(result.width).toBeCloseTo(result.height * 2, 1);
    });

    it('should enforce aspect ratio when resizing from bottom edge', () => {
      const crop: CropArea = { x: 0.1, y: 0.1, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'bottom', 0, 0.1, 2, minSize);
      expect(result.width).toBeCloseTo(result.height * 2, 1);
    });

    it('should clamp to image bounds', () => {
      const crop: CropArea = { x: 0.5, y: 0.5, width: 0.4, height: 0.4 };
      const result = resizeCropFromHandle(crop, 'bottom-right', 0.5, 0.5, undefined, minSize);
      expect(result.x + result.width).toBeLessThanOrEqual(1);
      expect(result.y + result.height).toBeLessThanOrEqual(1);
    });
  });

  describe('getInitialCropArea', () => {
    it('should return 80% centered crop when no aspect ratio given', () => {
      const crop = getInitialCropArea();
      expect(crop.x).toBeCloseTo(0.1);
      expect(crop.y).toBeCloseTo(0.1);
      expect(crop.width).toBeCloseTo(0.8);
      expect(crop.height).toBeCloseTo(0.8);
    });

    it('should return 80% centered crop when undefined aspect ratio', () => {
      const crop = getInitialCropArea(undefined);
      expect(crop.width).toBeCloseTo(0.8);
      expect(crop.height).toBeCloseTo(0.8);
    });

    it('should center a square crop for aspect ratio 1', () => {
      const crop = getInitialCropArea(1);
      expect(crop.width).toBeCloseTo(crop.height);
      expect(crop.x).toBeCloseTo((1 - crop.width) / 2);
      expect(crop.y).toBeCloseTo((1 - crop.height) / 2);
    });

    it('should create a wide crop for aspect ratio 16/9', () => {
      const crop = getInitialCropArea(16 / 9);
      expect(crop.width).toBeGreaterThan(crop.height);
      const actualAR = crop.width / crop.height;
      expect(actualAR).toBeCloseTo(16 / 9, 1);
    });

    it('should create a tall crop for aspect ratio 9/16', () => {
      const crop = getInitialCropArea(9 / 16);
      expect(crop.height).toBeGreaterThan(crop.width);
      const actualAR = crop.width / crop.height;
      expect(actualAR).toBeCloseTo(9 / 16, 1);
    });

    it('should fit within 0–1 bounds for any aspect ratio', () => {
      const ratios = [0.5, 1, 4 / 3, 16 / 9, 21 / 9, 3];
      ratios.forEach((ar) => {
        const crop = getInitialCropArea(ar);
        expect(crop.x).toBeGreaterThanOrEqual(0);
        expect(crop.y).toBeGreaterThanOrEqual(0);
        expect(crop.x + crop.width).toBeLessThanOrEqual(1.001); // small float tolerance
        expect(crop.y + crop.height).toBeLessThanOrEqual(1.001);
      });
    });
  });
});
