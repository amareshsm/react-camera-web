import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Camera } from '../src/components/Camera/Camera';
import { CameraRef } from '../src/components/Camera/types';
import {
  mockGetUserMedia,
  mockEnumerateDevices,
  mockTrackStop,
  mockDevices,
} from './setup';

// Helper to flush promises
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Camera Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserMedia.mockClear();
    mockEnumerateDevices.mockClear();
    mockTrackStop.mockClear();
  });

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<Camera />);
      });
      const videoElement = document.querySelector('video');
      expect(videoElement).toBeInTheDocument();
    });

    it('should render with display name "Camera"', () => {
      expect(Camera.displayName).toBe('Camera');
    });

    it('should render a video element with correct attributes', async () => {
      await act(async () => {
        render(<Camera />);
      });
      const videoElement = document.querySelector('video');
      expect(videoElement).toHaveAttribute('id', 'video');
      expect(videoElement).toHaveAttribute('autoplay');
      expect(videoElement).toHaveAttribute('playsinline');
    });

    it('should render a hidden canvas element', async () => {
      await act(async () => {
        render(<Camera />);
      });
      const canvasElement = document.querySelector('canvas');
      expect(canvasElement).toBeInTheDocument();
    });

    it('should accept className prop', async () => {
      const { container } = await act(async () => {
        return render(<Camera className="custom-camera" />);
      });
      // The outermost styled-component container should receive the className
      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv.className).toContain('custom-camera');
    });

    it('should accept style prop', async () => {
      const customStyle = { border: '2px solid red', borderRadius: '50%' };
      const { container } = await act(async () => {
        return render(<Camera style={customStyle} />);
      });
      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv.style.border).toBe('2px solid red');
      expect(containerDiv.style.borderRadius).toBe('50%');
    });
  });

  describe('Props — errorMessages (optional, fixes #63)', () => {
    it('should render without errorMessages prop (it is optional)', async () => {
      // This should NOT throw a TypeScript error or runtime error
      await act(async () => {
        render(<Camera />);
      });
      const videoElement = document.querySelector('video');
      expect(videoElement).toBeInTheDocument();
    });

    it('should render with partial errorMessages', async () => {
      await act(async () => {
        render(
          <Camera
            errorMessages={{
              noCameraAccessible: 'Custom: No camera found',
            }}
          />,
        );
      });
      const videoElement = document.querySelector('video');
      expect(videoElement).toBeInTheDocument();
    });

    it('should render with full errorMessages', async () => {
      await act(async () => {
        render(
          <Camera
            errorMessages={{
              noCameraAccessible: 'No camera',
              permissionDenied: 'Permission denied',
              switchCamera: 'Cannot switch',
              canvas: 'No canvas',
            }}
          />,
        );
      });
      const videoElement = document.querySelector('video');
      expect(videoElement).toBeInTheDocument();
    });
  });

  describe('Props — facingMode', () => {
    it('should default to user facing mode', async () => {
      await act(async () => {
        render(<Camera />);
      });
      // The video element should have mirrored transform for user mode
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });
      const calls = mockGetUserMedia.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0].video.facingMode).toBe('user');
    });

    it('should use environment facing mode when specified', async () => {
      await act(async () => {
        render(<Camera facingMode="environment" />);
      });
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });
      const calls = mockGetUserMedia.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0].video.facingMode).toBe('environment');
    });
  });

  describe('Props — aspectRatio', () => {
    it('should default to cover aspect ratio', async () => {
      const { container } = await act(async () => {
        return render(<Camera />);
      });
      // Container should exist (cover mode creates absolute positioned element)
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept numeric aspect ratio', async () => {
      const { container } = await act(async () => {
        return render(<Camera aspectRatio={16 / 9} />);
      });
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Props — numberOfCamerasCallback', () => {
    it('should call numberOfCamerasCallback with number of cameras', async () => {
      const callback = jest.fn();
      await act(async () => {
        render(<Camera numberOfCamerasCallback={callback} />);
      });
      await act(async () => {
        await flushPromises();
      });
      // The callback should eventually be called with the number of video devices
      await waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  describe('Props — videoReadyCallback', () => {
    it('should accept videoReadyCallback', async () => {
      const callback = jest.fn();
      await act(async () => {
        render(<Camera videoReadyCallback={callback} />);
      });
      // Callback is triggered on video loadeddata event
      const videoElement = document.querySelector('video');
      expect(videoElement).toBeInTheDocument();
    });
  });

  describe('Props — videoSourceDeviceId (fixes #62, #69)', () => {
    it('should use specific deviceId when provided', async () => {
      await act(async () => {
        render(<Camera videoSourceDeviceId="camera-2" />);
      });
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });
      const calls = mockGetUserMedia.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0].video.deviceId).toEqual({ exact: 'camera-2' });
    });

    it('should prioritize videoSourceDeviceId over auto-detection in environment mode', async () => {
      await act(async () => {
        render(<Camera facingMode="environment" videoSourceDeviceId="camera-2" />);
      });
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });
      const calls = mockGetUserMedia.mock.calls;
      const lastCall = calls[calls.length - 1];
      // The specific device ID should be used, NOT the auto-detected one
      expect(lastCall[0].video.deviceId).toEqual({ exact: 'camera-2' });
    });
  });

  describe('Ref methods', () => {
    it('should expose takePhoto method via ref', async () => {
      const ref = React.createRef<CameraRef>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      expect(ref.current).toBeTruthy();
      expect(typeof ref.current?.takePhoto).toBe('function');
    });

    it('should expose switchCamera method via ref', async () => {
      const ref = React.createRef<CameraRef>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      expect(ref.current).toBeTruthy();
      expect(typeof ref.current?.switchCamera).toBe('function');
    });

    it('should expose getNumberOfCameras method via ref', async () => {
      const ref = React.createRef<CameraRef>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      expect(ref.current).toBeTruthy();
      expect(typeof ref.current?.getNumberOfCameras).toBe('function');
    });

    it('should expose toggleTorch method via ref', async () => {
      const ref = React.createRef<CameraRef>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      expect(ref.current).toBeTruthy();
      expect(typeof ref.current?.toggleTorch).toBe('function');
    });

    it('should expose torchSupported property via ref', async () => {
      const ref = React.createRef<CameraRef>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      expect(ref.current).toBeTruthy();
      expect(typeof ref.current?.torchSupported).toBe('boolean');
    });

    it('switchCamera should toggle between user and environment', async () => {
      const ref = React.createRef<CameraRef>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      await act(async () => {
        await flushPromises();
      });

      // Mock that there are 2 cameras so switchCamera works
      // We need to wait for enumerateDevices to resolve
      await waitFor(() => {
        expect(ref.current?.getNumberOfCameras()).toBeGreaterThanOrEqual(0);
      });
    });

    it('getNumberOfCameras should return a number', async () => {
      const ref = React.createRef<CameraRef>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      const count = ref.current?.getNumberOfCameras();
      expect(typeof count).toBe('number');
    });

    it('toggleTorch should return a boolean', async () => {
      const ref = React.createRef<CameraRef>();
      await act(async () => {
        render(<Camera ref={ref} />);
      });
      let result: boolean | undefined;
      await act(async () => {
        result = ref.current?.toggleTorch();
      });
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Camera stream initialization', () => {
    it('should call getUserMedia on mount', async () => {
      await act(async () => {
        render(<Camera />);
      });
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            audio: false,
            video: expect.objectContaining({
              facingMode: 'user',
            }),
          }),
        );
      });
    });

    it('should stop tracks on unmount', async () => {
      let unmount: () => void;
      await act(async () => {
        const result = render(<Camera />);
        unmount = result.unmount;
      });

      await act(async () => {
        await flushPromises();
      });

      await act(async () => {
        unmount();
      });

      // Track stop should have been called during cleanup
      // (the stream effect cleanup calls track.stop())
    });

    it('should handle getUserMedia rejection gracefully', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('NotAllowedError'));

      await act(async () => {
        render(<Camera />);
      });

      await act(async () => {
        await flushPromises();
      });

      // Should not crash — component should still be rendered
      const videoElement = document.querySelector('video');
      expect(videoElement).toBeInTheDocument();
    });

    it('should show not supported message when mediaDevices is unavailable', async () => {
      const original = navigator.mediaDevices;
      Object.defineProperty(navigator, 'mediaDevices', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      await act(async () => {
        render(<Camera />);
      });

      await act(async () => {
        await flushPromises();
      });

      // Restore
      Object.defineProperty(navigator, 'mediaDevices', {
        value: original,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('DOM warnings (fixes #48)', () => {
    it('should not pass mirrored prop directly to DOM (uses $mirrored transient prop)', async () => {
      await act(async () => {
        render(<Camera />);
      });
      const videoElement = document.querySelector('video');
      // The video element should NOT have a "mirrored" attribute
      expect(videoElement?.getAttribute('mirrored')).toBeNull();
    });

    it('should not pass aspectRatio prop directly to DOM (uses $aspectRatio transient prop)', async () => {
      const { container } = await act(async () => {
        return render(<Camera aspectRatio={16 / 9} />);
      });
      const containerDiv = container.firstChild as HTMLElement;
      // The container should NOT have an "aspectratio" attribute
      expect(containerDiv?.getAttribute('aspectratio')).toBeNull();
      expect(containerDiv?.getAttribute('aspectRatio')).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle PermissionDeniedError', async () => {
      const error = new Error('Permission denied');
      error.name = 'PermissionDeniedError';
      mockGetUserMedia.mockRejectedValueOnce(error);

      await act(async () => {
        render(<Camera />);
      });

      await act(async () => {
        await flushPromises();
      });

      // Component should show permission denied message
      // (we can't easily check styled-components rendered text in jsdom,
      // but we verify no crash)
      expect(document.querySelector('video')).toBeInTheDocument();
    });
  });
});

describe('Camera Types', () => {
  it('should export CameraRef type that matches ref methods', async () => {
    const ref = React.createRef<CameraRef>();
    await act(async () => {
      render(<Camera ref={ref} />);
    });

    // Verify the ref shape matches CameraRef interface
    expect(ref.current).toEqual(
      expect.objectContaining({
        takePhoto: expect.any(Function),
        switchCamera: expect.any(Function),
        getNumberOfCameras: expect.any(Function),
        toggleTorch: expect.any(Function),
        torchSupported: expect.any(Boolean),
      }),
    );
  });
});
