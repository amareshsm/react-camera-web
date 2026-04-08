import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CropView } from '../src/components/CropView/CropView';
import { CropViewRef, CropResult } from '../src/components/CropView/CropView.types';

// A minimal 1×1 white pixel JPEG as base64 data URL for testing
const TEST_IMAGE =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKYH/9k=';

// Mock HTMLImageElement.naturalWidth/naturalHeight
const mockNaturalWidth = 640;
const mockNaturalHeight = 480;

beforeAll(() => {
  Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
    get: () => mockNaturalWidth,
    configurable: true,
  });
  Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {
    get: () => mockNaturalHeight,
    configurable: true,
  });
});

// Mock canvas context for extractCroppedImage
const mockDrawImage = jest.fn();
const mockGetImageData = jest.fn().mockReturnValue({
  data: new Uint8ClampedArray(4),
  width: 100,
  height: 100,
  colorSpace: 'srgb',
});

const mockCanvasCtx = {
  drawImage: mockDrawImage,
  getImageData: mockGetImageData,
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  putImageData: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  scale: jest.fn(),
  translate: jest.fn(),
  canvas: document.createElement('canvas'),
};

// Override createElement for canvas only when needed by extractCroppedImage
const originalCreateElement = document.createElement.bind(document);
jest.spyOn(document, 'createElement').mockImplementation((tag: string, options?: ElementCreationOptions) => {
  const el = originalCreateElement(tag, options);
  if (tag === 'canvas') {
    (el as HTMLCanvasElement).getContext = jest.fn().mockReturnValue(mockCanvasCtx) as any;
    (el as HTMLCanvasElement).toDataURL = jest.fn().mockReturnValue('data:image/jpeg;base64,croppedData');
  }
  return el;
});

describe('CropView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<CropView image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });
      const img = document.querySelector('img');
      expect(img).toBeInTheDocument();
    });

    it('should render with displayName "CropView"', () => {
      expect(CropView.displayName).toBe('CropView');
    });

    it('should render the source image', async () => {
      await act(async () => {
        render(<CropView image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });
      const img = document.querySelector('img');
      expect(img).toHaveAttribute('src', TEST_IMAGE);
      expect(img).toHaveAttribute('alt', 'Crop source');
    });

    it('should render confirm and cancel buttons', async () => {
      const { getByText } = await act(async () => {
        return render(<CropView image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });
      expect(getByText('Crop')).toBeInTheDocument();
      expect(getByText('Cancel')).toBeInTheDocument();
      expect(getByText('Reset')).toBeInTheDocument();
    });

    it('should accept className prop', async () => {
      const { container } = await act(async () => {
        return render(
          <CropView image={TEST_IMAGE} onCropComplete={jest.fn()} className="custom-crop" />,
        );
      });
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).toContain('custom-crop');
    });

    it('should accept style prop', async () => {
      const customStyle = { border: '3px solid blue' };
      const { container } = await act(async () => {
        return render(
          <CropView image={TEST_IMAGE} onCropComplete={jest.fn()} style={customStyle} />,
        );
      });
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.style.border).toBe('3px solid blue');
    });
  });

  describe('Props — labels', () => {
    it('should use default labels when not provided', async () => {
      const { getByText } = await act(async () => {
        return render(<CropView image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });
      expect(getByText('Crop')).toBeInTheDocument();
      expect(getByText('Cancel')).toBeInTheDocument();
      expect(getByText('Reset')).toBeInTheDocument();
    });

    it('should use custom labels when provided', async () => {
      const { getByText } = await act(async () => {
        return render(
          <CropView
            image={TEST_IMAGE}
            onCropComplete={jest.fn()}
            labels={{ confirm: 'Done', cancel: 'Back', reset: 'Undo' }}
          />,
        );
      });
      expect(getByText('Done')).toBeInTheDocument();
      expect(getByText('Back')).toBeInTheDocument();
      expect(getByText('Undo')).toBeInTheDocument();
    });

    it('should use partial custom labels (rest default)', async () => {
      const { getByText } = await act(async () => {
        return render(
          <CropView image={TEST_IMAGE} onCropComplete={jest.fn()} labels={{ confirm: 'Save' }} />,
        );
      });
      expect(getByText('Save')).toBeInTheDocument();
      expect(getByText('Cancel')).toBeInTheDocument();
      expect(getByText('Reset')).toBeInTheDocument();
    });
  });

  describe('Props — cropShape', () => {
    it('should default to rect crop shape', async () => {
      await act(async () => {
        render(<CropView image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });
      // Component renders without error — rect is default
      expect(document.querySelector('img')).toBeInTheDocument();
    });

    it('should accept circle crop shape', async () => {
      await act(async () => {
        render(<CropView image={TEST_IMAGE} onCropComplete={jest.fn()} cropShape="circle" />);
      });
      expect(document.querySelector('img')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should call onCropCancel when cancel is clicked', async () => {
      const onCancel = jest.fn();
      const { getByText } = await act(async () => {
        return render(
          <CropView image={TEST_IMAGE} onCropComplete={jest.fn()} onCropCancel={onCancel} />,
        );
      });

      await act(async () => {
        fireEvent.click(getByText('Cancel'));
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCropComplete when confirm is clicked (after image loads)', async () => {
      const onComplete = jest.fn();
      const { getByText } = await act(async () => {
        return render(<CropView image={TEST_IMAGE} onCropComplete={onComplete} />);
      });

      // Simulate image load
      const img = document.querySelector('img');
      await act(async () => {
        fireEvent.load(img!);
      });

      await act(async () => {
        fireEvent.click(getByText('Crop'));
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
      const result: CropResult = onComplete.mock.calls[0][0];
      expect(result).toHaveProperty('base64');
      expect(result).toHaveProperty('imgData');
      expect(result).toHaveProperty('cropArea');
      expect(result.cropArea).toHaveProperty('x');
      expect(result.cropArea).toHaveProperty('y');
      expect(result.cropArea).toHaveProperty('width');
      expect(result.cropArea).toHaveProperty('height');
    });

    it('should not crash if onCropCancel is not provided', async () => {
      const { getByText } = await act(async () => {
        return render(<CropView image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });

      // Should not throw
      await act(async () => {
        fireEvent.click(getByText('Cancel'));
      });
    });
  });

  describe('Ref methods', () => {
    it('should expose cropImage method via ref', async () => {
      const ref = React.createRef<CropViewRef>();
      await act(async () => {
        render(<CropView ref={ref} image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });
      expect(ref.current).toBeTruthy();
      expect(typeof ref.current?.cropImage).toBe('function');
    });

    it('should expose resetCrop method via ref', async () => {
      const ref = React.createRef<CropViewRef>();
      await act(async () => {
        render(<CropView ref={ref} image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });
      expect(typeof ref.current?.resetCrop).toBe('function');
    });

    it('should expose getCropArea method via ref', async () => {
      const ref = React.createRef<CropViewRef>();
      await act(async () => {
        render(<CropView ref={ref} image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });
      expect(typeof ref.current?.getCropArea).toBe('function');

      const area = ref.current?.getCropArea();
      expect(area).toBeDefined();
      expect(area).toHaveProperty('x');
      expect(area).toHaveProperty('y');
      expect(area).toHaveProperty('width');
      expect(area).toHaveProperty('height');
    });

    it('getCropArea should return a copy (not a reference)', async () => {
      const ref = React.createRef<CropViewRef>();
      await act(async () => {
        render(<CropView ref={ref} image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });

      const area1 = ref.current?.getCropArea();
      const area2 = ref.current?.getCropArea();
      expect(area1).toEqual(area2);
      expect(area1).not.toBe(area2); // different references
    });

    it('resetCrop should restore initial crop area', async () => {
      const ref = React.createRef<CropViewRef>();
      await act(async () => {
        render(<CropView ref={ref} image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });

      const initial = ref.current?.getCropArea();
      // Reset should produce the same area
      await act(async () => {
        ref.current?.resetCrop();
      });
      const afterReset = ref.current?.getCropArea();
      expect(afterReset).toEqual(initial);
    });

    it('cropImage should return CropResult after image loads', async () => {
      const ref = React.createRef<CropViewRef>();
      await act(async () => {
        render(<CropView ref={ref} image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });

      // Simulate image load
      const img = document.querySelector('img');
      await act(async () => {
        fireEvent.load(img!);
      });

      const result = ref.current?.cropImage();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('base64');
      expect(result).toHaveProperty('imgData');
      expect(result).toHaveProperty('cropArea');
    });
  });

  describe('Props — cropAspectRatio', () => {
    it('should work without cropAspectRatio (free-form)', async () => {
      const ref = React.createRef<CropViewRef>();
      await act(async () => {
        render(<CropView ref={ref} image={TEST_IMAGE} onCropComplete={jest.fn()} />);
      });

      const area = ref.current?.getCropArea();
      expect(area).toBeDefined();
      // Free-form default is 80% centered
      expect(area!.width).toBeCloseTo(0.8);
      expect(area!.height).toBeCloseTo(0.8);
    });

    it('should create square crop area when cropAspectRatio=1', async () => {
      const ref = React.createRef<CropViewRef>();
      await act(async () => {
        render(
          <CropView ref={ref} image={TEST_IMAGE} onCropComplete={jest.fn()} cropAspectRatio={1} />,
        );
      });

      const area = ref.current?.getCropArea();
      expect(area!.width).toBeCloseTo(area!.height);
    });

    it('should create wide crop area when cropAspectRatio=16/9', async () => {
      const ref = React.createRef<CropViewRef>();
      await act(async () => {
        render(
          <CropView ref={ref} image={TEST_IMAGE} onCropComplete={jest.fn()} cropAspectRatio={16 / 9} />,
        );
      });

      const area = ref.current?.getCropArea();
      expect(area!.width).toBeGreaterThan(area!.height);
    });
  });
});
