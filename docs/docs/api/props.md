---
sidebar_position: 1
title: Props
description: Complete reference of all props accepted by the Camera component.
---

# Props

The `Camera` component accepts the following props. **All props are optional** — the component works out of the box with zero configuration.

```tsx
import { Camera } from 'react-webcam-pro';

// All defaults — just works!
<Camera ref={cameraRef} />

// Fully configured
<Camera
  ref={cameraRef}
  facingMode="environment"
  aspectRatio={16 / 9}
  numberOfCamerasCallback={setNumberOfCameras}
  videoSourceDeviceId={activeDeviceId}
  errorMessages={{ noCameraAccessible: 'Custom message' }}
  videoReadyCallback={() => console.log('Ready!')}
  className="my-camera"
  style={{ borderRadius: 8 }}
/>
```

---

## `facingMode`

| Type | Default | Required |
|------|---------|----------|
| `'user' \| 'environment'` | `'user'` | No |

Controls which camera to use by default.

- **`'user'`** — Front-facing camera (selfie mode). The video is automatically mirrored.
- **`'environment'`** — Back-facing camera. No mirroring applied.

```tsx
// Use the back camera
<Camera facingMode="environment" />
```

:::tip
On desktop computers, there is typically only one camera, so this prop doesn't have much effect. It's most useful on mobile devices.
:::

---

## `aspectRatio`

| Type | Default | Required |
|------|---------|----------|
| `'cover' \| number` | `'cover'` | No |

Controls the aspect ratio of the camera view.

- **`'cover'`** — The camera fills the entire parent container (like `background-size: cover`).
- **`number`** — A specific aspect ratio expressed as a ratio (e.g., `16/9`, `4/3`, `1/1`).

```tsx
// Fill the container
<Camera aspectRatio="cover" />

// 16:9 widescreen
<Camera aspectRatio={16 / 9} />

// Square
<Camera aspectRatio={1} />

// 4:3 classic
<Camera aspectRatio={4 / 3} />
```

When a numeric aspect ratio is used, the component uses CSS `padding-bottom` to maintain the ratio. The captured photo will match the displayed aspect ratio.

---

## `numberOfCamerasCallback`

| Type | Default | Required |
|------|---------|----------|
| `(numberOfCameras: number) => void` | `() => null` | No |

Called whenever the number of available video input devices is detected.

This is useful for conditionally showing a "Switch Camera" button — you only want to show it when there are 2 or more cameras.

```tsx
const [numberOfCameras, setNumberOfCameras] = useState(0);

<Camera numberOfCamerasCallback={setNumberOfCameras} />

<button
  onClick={() => cameraRef.current?.switchCamera()}
  disabled={numberOfCameras <= 1}
>
  Switch Camera
</button>
```

---

## `videoSourceDeviceId`

| Type | Default | Required |
|------|---------|----------|
| `string \| undefined` | `undefined` | No |

Specifies a particular video input device to use by its `deviceId`. When provided, this takes priority over `facingMode` for device selection.

You can get a list of available devices using `navigator.mediaDevices.enumerateDevices()`:

```tsx
const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
const [activeDeviceId, setActiveDeviceId] = useState<string>();

useEffect(() => {
  navigator.mediaDevices.enumerateDevices().then((allDevices) => {
    setDevices(allDevices.filter((d) => d.kind === 'videoinput'));
  });
}, []);

<Camera videoSourceDeviceId={activeDeviceId} />

<select onChange={(e) => setActiveDeviceId(e.target.value)}>
  {devices.map((d) => (
    <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
  ))}
</select>
```

:::note
When `videoSourceDeviceId` is set, it uses `{ deviceId: { exact: id } }` in the `getUserMedia` constraints, ensuring the exact requested device is used. This was fixed in v1.0.0 — in the original `react-camera-pro`, the auto-detection logic could override the device ID in environment mode.
:::

---

## `errorMessages`

| Type | Default | Required |
|------|---------|----------|
| `ErrorMessages` (object) | See below | No |

Custom error messages displayed when camera access fails. **All fields are optional** — any field you don't provide will use the default message.

### Default Error Messages

```ts
{
  noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
  permissionDenied: 'Permission denied. Please refresh and give camera permission.',
  switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
  canvas: 'Canvas is not supported.',
}
```

### Override Specific Messages

You can override just the messages you want to change:

```tsx
<Camera
  errorMessages={{
    noCameraAccessible: 'Cannot access any camera. Please check your device.',
    permissionDenied: 'Camera access was denied. Please allow camera access in your browser settings.',
  }}
/>
```

### ErrorMessages Interface

```ts
interface ErrorMessages {
  noCameraAccessible?: string;
  permissionDenied?: string;
  switchCamera?: string;
  canvas?: string;
}
```

:::tip Previously Required
In `react-camera-pro`, the `errorMessages` prop was **required**, which forced users to pass all four messages even when using defaults. In `react-webcam-pro`, it's fully optional.
:::

---

## `videoReadyCallback`

| Type | Default | Required |
|------|---------|----------|
| `() => void` | `() => null` | No |

Called when the video stream is loaded and ready to display. This is triggered by the `onLoadedData` event of the underlying `<video>` element.

Useful for hiding a loading spinner or showing UI controls only after the camera is ready:

```tsx
const [isReady, setIsReady] = useState(false);

<Camera videoReadyCallback={() => setIsReady(true)} />

{!isReady && <div>Loading camera...</div>}
{isReady && <button>📸 Take Photo</button>}
```

---

## `className`

| Type | Default | Required |
|------|---------|----------|
| `string` | `undefined` | No |

CSS class name applied to the outer camera container `<div>`.

```tsx
<Camera className="my-camera-wrapper" />
```

```css
.my-camera-wrapper {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

:::info New in v1.0.0
This prop was not available in `react-camera-pro`. It was one of the most [requested features](https://github.com/purple-technology/react-camera-pro/issues/47).
:::

---

## `style`

| Type | Default | Required |
|------|---------|----------|
| `React.CSSProperties` | `undefined` | No |

Inline styles applied to the outer camera container `<div>`.

```tsx
<Camera
  style={{
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  }}
/>
```

:::info New in v1.0.0
This prop was not available in `react-camera-pro`.
:::

---

## `videoConstraints`

| Type | Default | Required |
|------|---------|----------|
| `MediaTrackConstraints` | `undefined` | No |

Custom video constraints passed directly to [`getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia). Use this to control camera resolution, frame rate, and other hardware capabilities.

The constraints are **merged** into the internal `getUserMedia` call after `deviceId` and `facingMode`, so any property you set here will override the defaults.

```tsx
// Request Full HD at 30fps
<Camera
  videoConstraints={{
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
  }}
/>

// Request exact 4K resolution
<Camera
  videoConstraints={{
    width: { exact: 3840 },
    height: { exact: 2160 },
  }}
/>

// Set a minimum frame rate
<Camera
  videoConstraints={{
    frameRate: { min: 24, ideal: 60 },
  }}
/>
```

:::tip How `ideal` vs `exact` works
- **`ideal`** — The browser will try to match this value but will fall back gracefully if the hardware doesn't support it.
- **`exact`** — The browser will **fail** if the hardware can't match exactly. Only use this when you're sure the device supports it.
- **`min` / `max`** — Set a range. The browser picks the best value within the range.
:::

:::info New in v1.1.0
This prop was not available in previous versions. See the [v1.1.0 release notes](/docs/releases/v1.1.0).
:::

---

## Props Summary Table

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `facingMode` | `'user' \| 'environment'` | `'user'` | Default camera direction |
| `aspectRatio` | `'cover' \| number` | `'cover'` | Video aspect ratio |
| `numberOfCamerasCallback` | `(n: number) => void` | `() => null` | Camera count callback |
| `videoSourceDeviceId` | `string` | `undefined` | Specific device ID |
| `errorMessages` | `ErrorMessages` | See above | Custom error messages |
| `videoReadyCallback` | `() => void` | `() => null` | Video ready callback |
| `className` | `string` | `undefined` | CSS class name |
| `style` | `CSSProperties` | `undefined` | Inline styles |
| `videoConstraints` | `MediaTrackConstraints` | `undefined` | Custom video constraints |
