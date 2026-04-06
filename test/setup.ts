/**
 * Mock setup for MediaDevices and related browser APIs
 * These mocks simulate the browser's media capture APIs in a jsdom environment
 */

// Store callbacks for track events
const mockTrackStop = jest.fn();
const mockTrackApplyConstraints = jest.fn().mockResolvedValue(undefined);

const createMockMediaStream = (deviceCount = 1): MediaStream => {
  const stream = {
    getTracks: jest.fn(() => [
      {
        stop: mockTrackStop,
        applyConstraints: mockTrackApplyConstraints,
        kind: 'video',
        label: 'Mock Camera',
        enabled: true,
      },
    ]),
    getVideoTracks: jest.fn(() => [
      {
        stop: mockTrackStop,
        applyConstraints: mockTrackApplyConstraints,
        kind: 'video',
        label: 'Mock Camera',
        enabled: true,
      },
    ]),
    getAudioTracks: jest.fn(() => []),
    active: true,
    id: 'mock-stream-id',
    addTrack: jest.fn(),
    removeTrack: jest.fn(),
    clone: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  } as unknown as MediaStream;
  return stream;
};

const mockDevices: MediaDeviceInfo[] = [
  {
    deviceId: 'camera-1',
    groupId: 'group-1',
    kind: 'videoinput',
    label: 'Front Camera',
    toJSON: () => ({}),
  },
  {
    deviceId: 'camera-2',
    groupId: 'group-2',
    kind: 'videoinput',
    label: 'Back Camera',
    toJSON: () => ({}),
  },
];

// Add getCapabilities to each device (InputDeviceInfo)
(mockDevices as any).forEach((device: any) => {
  device.getCapabilities = () => ({
    deviceId: device.deviceId,
    facingMode: device.label.includes('Back') ? ['environment'] : ['user'],
  });
});

const mockGetUserMedia = jest.fn().mockImplementation(() => {
  return Promise.resolve(createMockMediaStream(2));
});

const mockEnumerateDevices = jest.fn().mockResolvedValue(mockDevices);

const mockGetSupportedConstraints = jest.fn().mockReturnValue({
  width: true,
  height: true,
  facingMode: true,
  deviceId: true,
});

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: mockEnumerateDevices,
    getSupportedConstraints: mockGetSupportedConstraints,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  writable: true,
  configurable: true,
});

// Mock HTMLVideoElement properties that jsdom doesn't support
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  value: jest.fn().mockResolvedValue(undefined),
  writable: true,
});

Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(HTMLVideoElement.prototype, 'load', {
  value: jest.fn(),
  writable: true,
});

// Mock HTMLCanvasElement.getContext
const mockGetImageData = jest.fn().mockReturnValue({
  data: new Uint8ClampedArray(4),
  width: 1,
  height: 1,
  colorSpace: 'srgb',
});

const mockDrawImage = jest.fn();

const mockCanvasContext = {
  drawImage: mockDrawImage,
  getImageData: mockGetImageData,
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  putImageData: jest.fn(),
  canvas: document.createElement('canvas'),
};

HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockCanvasContext) as any;
HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/jpeg;base64,mockImageData');

export {
  mockGetUserMedia,
  mockEnumerateDevices,
  mockGetSupportedConstraints,
  mockTrackStop,
  mockTrackApplyConstraints,
  createMockMediaStream,
  mockDevices,
  mockDrawImage,
  mockGetImageData,
  mockCanvasContext,
};
