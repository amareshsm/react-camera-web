---
sidebar_position: 2
title: Methods
description: Complete reference of all methods available on the Camera ref.
---

# Methods (via Ref)

The `Camera` component is controlled through a [React ref](https://react.dev/learn/manipulating-the-dom-with-refs). This gives you imperative access to camera actions like taking photos, switching cameras, and toggling the torch.

## Setup

To use camera methods, create a ref and attach it to the `Camera` component:

```tsx
import { useRef } from 'react';
import { Camera, CameraRef } from 'react-webcam-pro';

const App = () => {
  const cameraRef = useRef<CameraRef>(null);

  return <Camera ref={cameraRef} />;
};
```

You can then call methods on `cameraRef.current`:

```tsx
const photo = cameraRef.current?.takePhoto();
```

---

## `takePhoto(type?)` / `takePhoto(options?)`

Captures the current camera frame as an image.

### Signature 1: String argument (original)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | `'base64url' \| 'imgData'` | `'base64url'` | Output format |

### Signature 2: Options object (new in v1.1.0)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.type` | `'base64url' \| 'imgData'` | `'base64url'` | Output format |
| `options.mirror` | `boolean` | `false` | Mirror the captured photo horizontally |

**Returns:** `string | ImageData`

Both signatures are supported — the original string argument continues to work for full backward compatibility.

### Base64 URL (default)

Returns the captured image as a base64-encoded JPEG data URL. This can be used directly as an `<img>` `src` attribute:

```tsx
const handleCapture = () => {
  if (cameraRef.current) {
    const photo = cameraRef.current.takePhoto();
    // photo is a string like "data:image/jpeg;base64,/9j/4AAQ..."
    setImage(photo as string);
  }
};

// Display the captured image
<img src={image} alt="Captured photo" />
```

### ImageData

Returns raw pixel data as an [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object. Useful for image processing:

```tsx
const handleCapture = () => {
  if (cameraRef.current) {
    const imageData = cameraRef.current.takePhoto('imgData');
    // imageData is an ImageData object with .data, .width, .height
    processPixels(imageData as ImageData);
  }
};
```

### Mirrored Photos (new in v1.1.0)

User-facing cameras show a mirrored preview (like a mirror), but by default `takePhoto()` captures the un-mirrored image. Use the `mirror` option to capture a photo that matches what the user sees:

```tsx
// Mirrored selfie — matches the preview
const photo = cameraRef.current.takePhoto({ mirror: true });

// Mirrored ImageData
const imgData = cameraRef.current.takePhoto({ type: 'imgData', mirror: true });

// Non-mirrored (default behavior)
const photo = cameraRef.current.takePhoto();
const photo = cameraRef.current.takePhoto({ mirror: false });
```

:::tip When to use mirror
Enable `mirror: true` for selfies so text and faces appear the way the user expects (as in a mirror). Leave it off for document scanning or environment camera captures.
:::

### Aspect Ratio Matching

The captured photo automatically matches the **displayed** aspect ratio of the camera view. If the camera's native resolution doesn't match the container's aspect ratio, the image is cropped to match — just like what the user sees on screen.

### Error Handling

`takePhoto()` will throw an error if:
- No camera is accessible
- The canvas element is not available (very rare)

```tsx
try {
  const photo = cameraRef.current.takePhoto();
} catch (error) {
  console.error('Failed to take photo:', error.message);
}
```

---

## `switchCamera()`

Switches between front (`user`) and back (`environment`) cameras.

**Returns:** `FacingMode` (`'user' | 'environment'`) — the new facing mode after switching.

```tsx
const handleSwitch = () => {
  if (cameraRef.current) {
    const newMode = cameraRef.current.switchCamera();
    console.log(`Switched to: ${newMode}`); // 'user' or 'environment'
  }
};
```

### Behavior

- Toggles between `'user'` and `'environment'` facing modes.
- If only one camera is available, it logs a console warning but still returns the new mode value.
- Throws an error if **no** cameras are accessible.

### Best Practice

Only show the switch button when multiple cameras are detected:

```tsx
const [numCameras, setNumCameras] = useState(0);

<Camera
  ref={cameraRef}
  numberOfCamerasCallback={setNumCameras}
/>

{numCameras > 1 && (
  <button onClick={() => cameraRef.current?.switchCamera()}>
    🔄 Switch Camera
  </button>
)}
```

---

## `getNumberOfCameras()`

Returns the number of available video input devices.

**Returns:** `number`

```tsx
const count = cameraRef.current?.getNumberOfCameras();
console.log(`${count} camera(s) available`);
```

:::tip
This returns the same value that's provided via the [`numberOfCamerasCallback`](/docs/api/props#numberofcamerascallback) prop. Use the prop if you need reactive updates; use this method for one-off queries.
:::

---

## `toggleTorch()`

Toggles the device's flashlight / torch on or off.

**Returns:** `boolean` — the new torch state (`true` = on, `false` = off).

```tsx
const [isTorchOn, setIsTorchOn] = useState(false);

const handleTorch = () => {
  if (cameraRef.current) {
    const newState = cameraRef.current.toggleTorch();
    setIsTorchOn(newState);
  }
};

<button onClick={handleTorch}>
  {isTorchOn ? '🔦 Torch ON' : '🔦 Torch OFF'}
</button>
```

:::caution Browser Support
Torch control requires the [ImageCapture API](https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture) which is not supported in all browsers. Always check `torchSupported` before showing torch controls.
:::

---

## `torchSupported`

A **boolean property** (not a method) indicating whether the current camera supports torch control.

**Type:** `boolean`

```tsx
// Only show torch button if supported
{cameraRef.current?.torchSupported && (
  <button onClick={() => cameraRef.current?.toggleTorch()}>
    🔦 Toggle Torch
  </button>
)}
```

:::note
Torch support is detected asynchronously after the camera stream starts. It may initially be `false` and then become `true` once the stream is established and the browser reports torch capability.
:::

---

## Methods Summary Table

| Member | Type | Returns | Description |
|--------|------|---------|-------------|
| `takePhoto(type?)` | Method | `string \| ImageData` | Captures the current frame |
| `switchCamera()` | Method | `FacingMode` | Switches between front/back camera |
| `getNumberOfCameras()` | Method | `number` | Returns number of available cameras |
| `toggleTorch()` | Method | `boolean` | Toggles the torch on/off |
| `torchSupported` | Property | `boolean` | Whether torch is supported |

## CameraRef Interface

The complete TypeScript interface for the camera ref:

```ts
interface CameraRef {
  takePhoto(type?: 'base64url' | 'imgData'): string | ImageData;
  switchCamera(): FacingMode;
  getNumberOfCameras(): number;
  toggleTorch(): boolean;
  torchSupported: boolean;
}
```

---

# CropView Methods (via Ref)

The `CropView` component is also controlled through a React ref. This gives you imperative access to crop actions like extracting the cropped image, resetting the crop area, and reading the current crop coordinates.

:::info New in v1.2.0
The `CropView` component was introduced in v1.2.0. See the [v1.2.0 release notes](/docs/releases/v1.2.0) and the [Cropping Guide](/docs/guides/cropping).
:::

## Setup

```tsx
import { useRef } from 'react';
import { CropView, CropViewRef } from 'react-webcam-pro';

const App = () => {
  const cropRef = useRef<CropViewRef>(null);

  return <CropView ref={cropRef} image={photoBase64} />;
};
```

You can then call methods on `cropRef.current`:

```tsx
const result = await cropRef.current?.cropImage();
```

---

## `cropImage()`

| Returns | Async |
|---------|-------|
| `Promise<CropResult>` | Yes |

Extracts the cropped region from the source image using the Canvas API. Returns a `CropResult` object containing the cropped image in multiple formats.

```tsx
const handleConfirm = async () => {
  const result = await cropRef.current?.cropImage();
  if (result) {
    console.log(result.base64);    // data:image/png;base64,…
    console.log(result.imageData); // ImageData object
    console.log(result.cropArea);  // { x, y, width, height }
  }
};
```

**`CropResult` shape:**

| Property | Type | Description |
|----------|------|-------------|
| `base64` | `string` | Base64-encoded PNG data URL |
| `imageData` | `ImageData` | Raw pixel data (for canvas/WebGL use) |
| `cropArea` | `CropArea` | The fractional crop coordinates used |

---

## `resetCrop()`

| Returns |
|---------|
| `void` |

Resets the crop area back to its initial position (centered, respecting `cropAspectRatio` if set).

```tsx
<button onClick={() => cropRef.current?.resetCrop()}>
  Reset
</button>
```

---

## `getCropArea()`

| Returns |
|---------|
| `CropArea` |

Returns a **copy** of the current crop area. Values are fractional (0–1) relative to the image dimensions.

```tsx
const area = cropRef.current?.getCropArea();
// { x: 0.1, y: 0.15, width: 0.8, height: 0.7 }
```

:::tip
`getCropArea()` returns a copy, not a reference. Mutating the returned object does **not** affect the crop box.
:::

---

## CropView Methods Summary

| Member | Kind | Returns | Description |
|--------|------|---------|-------------|
| `cropImage()` | Method | `Promise<CropResult>` | Extracts the cropped image |
| `resetCrop()` | Method | `void` | Resets crop to initial state |
| `getCropArea()` | Method | `CropArea` | Returns current crop coordinates |

## CropViewRef Interface

The complete TypeScript interface for the crop view ref:

```ts
interface CropViewRef {
  cropImage(): Promise<CropResult>;
  resetCrop(): void;
  getCropArea(): CropArea;
}
```
