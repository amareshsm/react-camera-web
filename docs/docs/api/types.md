---
sidebar_position: 3
title: Types
description: Complete TypeScript type definitions exported by react-webcam-pro.
---

# Types

`react-webcam-pro` is written in TypeScript and exports all its types. This page documents every exported type.

## Importing Types

```tsx
import {
  Camera,
  CameraRef,
  CameraProps,
  TakePhotoOptions, // new in v1.1.0
  CameraType,       // deprecated alias — use CameraRef
  CropView,         // new in v1.2.0
  CropViewRef,      // new in v1.2.0
  CropViewProps,    // new in v1.2.0
  CropArea,         // new in v1.2.0
  CropResult,       // new in v1.2.0
} from 'react-webcam-pro';
```

---

## `CameraRef`

The interface for the camera ref object. Use this to type your `useRef`:

```ts
interface CameraRef {
  takePhoto(type?: 'base64url' | 'imgData'): string | ImageData;
  takePhoto(options?: TakePhotoOptions): string | ImageData;
  switchCamera(): FacingMode;
  getNumberOfCameras(): number;
  toggleTorch(): boolean;
  torchSupported: boolean;
}
```

### Usage

```tsx
import { useRef } from 'react';
import { Camera, CameraRef } from 'react-webcam-pro';

const cameraRef = useRef<CameraRef>(null);

<Camera ref={cameraRef} />
```

---

## `CameraType` *(deprecated)*

An alias for `CameraRef`. Kept for backward compatibility with `react-camera-pro`.

```ts
/** @deprecated Use CameraRef instead */
type CameraType = CameraRef;
```

If you're migrating from `react-camera-pro`, your existing `useRef<CameraType>(null)` code will continue to work. However, we recommend updating to `CameraRef` for clarity.

```diff
- import { CameraType } from 'react-webcam-pro';
- const camera = useRef<CameraType>(null);
+ import { CameraRef } from 'react-webcam-pro';
+ const camera = useRef<CameraRef>(null);
```

---

## `CameraProps`

The props interface for the `Camera` component:

```ts
interface CameraProps {
  facingMode?: FacingMode;
  aspectRatio?: AspectRatio;
  numberOfCamerasCallback?(numberOfCameras: number): void;
  videoSourceDeviceId?: string | undefined;
  errorMessages?: ErrorMessages;
  videoReadyCallback?(): void;
  className?: string;
  style?: React.CSSProperties;
  videoConstraints?: MediaTrackConstraints; // new in v1.1.0
}
```

See the [Props](/docs/api/props) page for detailed documentation of each property.

---

## `TakePhotoOptions`

Options object for `takePhoto()`. New in v1.1.0.

```ts
interface TakePhotoOptions {
  /** Output format: base64 JPEG data URL or raw ImageData. Default: 'base64url' */
  type?: 'base64url' | 'imgData';
  /** Mirror the captured photo horizontally. Useful for user-facing cameras. */
  mirror?: boolean;
}
```

### Usage

```tsx
// Mirrored selfie
const photo = cameraRef.current.takePhoto({ mirror: true });

// Mirrored ImageData for processing
const imgData = cameraRef.current.takePhoto({ type: 'imgData', mirror: true });
```

---

## `FacingMode`

The camera direction type:

```ts
type FacingMode = 'user' | 'environment';
```

- `'user'` — Front-facing camera (selfie). Video is automatically mirrored.
- `'environment'` — Rear-facing camera. No mirroring.

---

## `AspectRatio`

The aspect ratio type:

```ts
type AspectRatio = 'cover' | number;
```

- `'cover'` — Camera fills the entire container.
- `number` — A numeric ratio like `16/9` (= `1.777...`), `4/3` (= `1.333...`), `1` (square).

---

## `ErrorMessages`

Custom error messages interface:

```ts
interface ErrorMessages {
  noCameraAccessible?: string;
  permissionDenied?: string;
  switchCamera?: string;
  canvas?: string;
}
```

All fields are optional. Any field not provided will use the default message.

| Field | Default |
|-------|---------|
| `noCameraAccessible` | `'No camera device accessible. Please connect your camera or try a different browser.'` |
| `permissionDenied` | `'Permission denied. Please refresh and give camera permission.'` |
| `switchCamera` | `'It is not possible to switch camera to different one because there is only one video device accessible.'` |
| `canvas` | `'Canvas is not supported.'` |

---

## Internal Types

The following types are used internally and **not exported** from the package. They are documented here for reference:

```ts
type Stream = MediaStream | null;
type SetStream = React.Dispatch<React.SetStateAction<Stream>>;
type SetNumberOfCameras = React.Dispatch<React.SetStateAction<number>>;
type SetNotSupported = React.Dispatch<React.SetStateAction<boolean>>;
type SetPermissionDenied = React.Dispatch<React.SetStateAction<boolean>>;
```

These are standard React state setter types used within the Camera component's implementation.

---

## CropView Types *(new in v1.2.0)*

### `CropViewRef`

The interface for the CropView ref object:

```ts
interface CropViewRef {
  cropImage: () => CropResult;
  resetCrop: () => void;
  getCropArea: () => CropArea;
}
```

### `CropViewProps`

The props interface for the `CropView` component:

```ts
interface CropViewProps {
  image: string;
  cropAspectRatio?: number;
  cropShape?: 'rect' | 'circle';
  minCropSize?: number;
  onCropComplete: (result: CropResult) => void;
  onCropCancel?: () => void;
  labels?: { confirm?: string; cancel?: string; reset?: string };
  className?: string;
  style?: React.CSSProperties;
}
```

See the [Cropping Guide](/docs/guides/cropping) for detailed documentation of each property.

### `CropArea`

Represents the crop region as fractions (0–1) relative to the image:

```ts
interface CropArea {
  x: number;      // Left offset (0–1)
  y: number;      // Top offset (0–1)
  width: number;  // Width (0–1)
  height: number; // Height (0–1)
}
```

### `CropResult`

The result returned when a crop is confirmed:

```ts
interface CropResult {
  base64: string;      // Cropped image as JPEG data URL
  imgData: ImageData;  // Cropped image as raw ImageData
  cropArea: CropArea;  // The crop area used
}
```
