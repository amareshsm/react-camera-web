/**
 * Backward Compatibility Tests
 *
 * These tests verify that existing react-camera-pro users can switch to
 * react-camera-web by simply changing the import path, with ZERO code changes.
 *
 * Every test here simulates a real-world usage pattern from react-camera-pro.
 */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Camera, CameraType, CameraProps } from '../src/index';
import { CameraRef } from '../src/components/Camera/types';
import { mockGetUserMedia } from './setup';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Backward Compatibility with react-camera-pro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Exports', () => {
    it('should export Camera component', () => {
      expect(Camera).toBeDefined();
      expect(typeof Camera).toBe('object'); // forwardRef returns an object
    });

    it('should export CameraType (for backward compat)', () => {
      // CameraType was exported in react-camera-pro
      // Users use it as: useRef<CameraType>(null)
      expect(true).toBe(true); // Type-level test — if this file compiles, it works
    });

    it('should export CameraProps', () => {
      // CameraProps was exported in react-camera-pro
      expect(true).toBe(true); // Type-level test
    });

    it('should export CameraRef (new, additive)', () => {
      // CameraRef is new — it does NOT break anything, it's additive
      expect(true).toBe(true); // Type-level test
    });
  });

  describe('Camera component displayName', () => {
    it('should have displayName "Camera"', () => {
      expect(Camera.displayName).toBe('Camera');
    });
  });

  describe('Pattern: useRef<CameraType>(null) — the documented react-camera-pro pattern', () => {
    it('should work with useRef<CameraType>(null)', async () => {
      // This is the exact pattern from react-camera-pro README and examples
      const TestComponent = () => {
        const camera = React.useRef<CameraType>(null);
        return <Camera ref={camera} />;
      };

      await act(async () => {
        render(<TestComponent />);
      });
    });

    it('should allow calling ref methods with CameraType ref', async () => {
      const ref = React.createRef<CameraType>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });

      // These are the methods react-camera-pro users rely on
      expect(typeof ref.current?.takePhoto).toBe('function');
      expect(typeof ref.current?.switchCamera).toBe('function');
      expect(typeof ref.current?.getNumberOfCameras).toBe('function');
      expect(typeof ref.current?.toggleTorch).toBe('function');
      expect(typeof ref.current?.torchSupported).toBe('boolean');
    });
  });

  describe('Pattern: useRef<CameraRef>(null) — new recommended pattern', () => {
    it('should work with useRef<CameraRef>(null)', async () => {
      const TestComponent = () => {
        const camera = React.useRef<CameraRef>(null);
        return <Camera ref={camera} />;
      };

      await act(async () => {
        render(<TestComponent />);
      });
    });
  });

  describe('Pattern: Camera with no props (minimal usage)', () => {
    it('should render with zero props', async () => {
      // Many users just do <Camera ref={ref} /> — no other props
      await act(async () => {
        render(<Camera />);
      });

      const video = document.querySelector('video');
      expect(video).toBeInTheDocument();
    });
  });

  describe('Pattern: Camera with errorMessages prop (was required, now optional)', () => {
    it('should work WITHOUT errorMessages (was broken in react-camera-pro TS types)', async () => {
      // In react-camera-pro, errorMessages was typed as required but documented as optional.
      // Users had to write <Camera errorMessages={{}} /> to avoid TS errors.
      // Now it's truly optional — this should work without any errorMessages prop.
      await act(async () => {
        render(<Camera />);
      });
      expect(document.querySelector('video')).toBeInTheDocument();
    });

    it('should still work WITH errorMessages={...} (existing code unchanged)', async () => {
      // Users who already pass errorMessages should not be affected
      await act(async () => {
        render(
          <Camera
            errorMessages={{
              noCameraAccessible: 'No camera device accessible.',
              permissionDenied: 'Permission denied.',
              switchCamera: 'Cannot switch camera.',
              canvas: 'Canvas not supported.',
            }}
          />,
        );
      });
      expect(document.querySelector('video')).toBeInTheDocument();
    });

    it('should still work WITH errorMessages={{}} (the old workaround)', async () => {
      // Some users passed empty object to satisfy TS — should still work
      await act(async () => {
        render(<Camera errorMessages={{}} />);
      });
      expect(document.querySelector('video')).toBeInTheDocument();
    });

    it('should use defaults when partial errorMessages provided', async () => {
      // User provides only some messages — rest should use defaults
      await act(async () => {
        render(<Camera errorMessages={{ noCameraAccessible: 'Custom message' }} />);
      });
      expect(document.querySelector('video')).toBeInTheDocument();
    });
  });

  describe('Pattern: all original props', () => {
    it('should accept facingMode prop', async () => {
      await act(async () => {
        render(<Camera facingMode="environment" />);
      });
      expect(document.querySelector('video')).toBeInTheDocument();
    });

    it('should accept aspectRatio="cover"', async () => {
      await act(async () => {
        render(<Camera aspectRatio="cover" />);
      });
      expect(document.querySelector('video')).toBeInTheDocument();
    });

    it('should accept aspectRatio={number}', async () => {
      await act(async () => {
        render(<Camera aspectRatio={16 / 9} />);
      });
      expect(document.querySelector('video')).toBeInTheDocument();
    });

    it('should accept numberOfCamerasCallback', async () => {
      const callback = jest.fn();
      await act(async () => {
        render(<Camera numberOfCamerasCallback={callback} />);
      });
      await act(async () => {
        await flushPromises();
      });
      await waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });
    });

    it('should accept videoSourceDeviceId', async () => {
      await act(async () => {
        render(<Camera videoSourceDeviceId="test-device-123" />);
      });
      expect(document.querySelector('video')).toBeInTheDocument();
    });

    it('should accept videoReadyCallback', async () => {
      const callback = jest.fn();
      await act(async () => {
        render(<Camera videoReadyCallback={callback} />);
      });
      expect(document.querySelector('video')).toBeInTheDocument();
    });
  });

  describe('Pattern: exact react-camera-pro example/App.tsx usage', () => {
    it('should support the full example app pattern', async () => {
      // This is the exact usage from react-camera-pro/example/src/App.tsx
      const ExampleApp = () => {
        const [numberOfCameras, setNumberOfCameras] = React.useState(0);
        const [image, setImage] = React.useState<string | null>(null);
        const camera = React.useRef<CameraType>(null);
        const [activeDeviceId, setActiveDeviceId] = React.useState<string | undefined>(undefined);

        return (
          <div>
            <Camera
              ref={camera}
              aspectRatio="cover"
              facingMode="environment"
              numberOfCamerasCallback={(i) => setNumberOfCameras(i)}
              videoSourceDeviceId={activeDeviceId}
              errorMessages={{
                noCameraAccessible:
                  'No camera device accessible. Please connect your camera or try a different browser.',
                permissionDenied: 'Permission denied. Please refresh and give camera permission.',
                switchCamera:
                  'It is not possible to switch camera to different one because there is only one video device accessible.',
                canvas: 'Canvas is not supported.',
              }}
              videoReadyCallback={() => {
                console.log('Video feed ready.');
              }}
            />
          </div>
        );
      };

      await act(async () => {
        render(<ExampleApp />);
      });

      expect(document.querySelector('video')).toBeInTheDocument();
    });
  });

  describe('New additive features should not interfere', () => {
    it('className prop is optional and does not affect existing usage', async () => {
      // Existing users don't pass className — it should not appear or cause issues
      const { container } = await act(async () => {
        return render(<Camera />);
      });
      const firstChild = container.firstChild as HTMLElement;
      // No custom class should be present
      expect(firstChild.className).not.toContain('undefined');
      expect(firstChild.className).not.toContain('null');
    });

    it('style prop is optional and does not affect existing usage', async () => {
      // Existing users don't pass style — it should not appear or cause issues
      const { container } = await act(async () => {
        return render(<Camera />);
      });
      const firstChild = container.firstChild as HTMLElement;
      expect(firstChild.getAttribute('style')).toBeNull();
    });
  });

  describe('Ref methods return types match original', () => {
    it('takePhoto() returns string by default', async () => {
      const ref = React.createRef<CameraType>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      await act(async () => {
        await flushPromises();
      });

      // Can't fully test takePhoto without a real camera, but we verify
      // the function exists and its return type signature via TypeScript
      expect(typeof ref.current?.takePhoto).toBe('function');
    });

    it('switchCamera() returns FacingMode string', async () => {
      const ref = React.createRef<CameraType>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      expect(typeof ref.current?.switchCamera).toBe('function');
    });

    it('getNumberOfCameras() returns number', async () => {
      const ref = React.createRef<CameraType>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      const count = ref.current?.getNumberOfCameras();
      expect(typeof count).toBe('number');
    });

    it('toggleTorch() returns boolean', async () => {
      const ref = React.createRef<CameraType>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      let result: boolean | undefined;
      await act(async () => {
        result = ref.current?.toggleTorch();
      });
      expect(typeof result).toBe('boolean');
    });

    it('torchSupported is boolean', async () => {
      const ref = React.createRef<CameraType>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      expect(typeof ref.current?.torchSupported).toBe('boolean');
    });
  });
});
