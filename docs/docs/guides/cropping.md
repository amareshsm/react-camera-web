---
sidebar_position: 8
title: Cropping Photos
description: How to use the CropView component for WhatsApp-style photo cropping.
---

# Cropping Photos

**New in v1.2.0** — `react-webcam-pro` includes a `<CropView />` component that provides WhatsApp-style interactive image cropping. It works on all web platforms: desktop (Mac, Windows, Linux), Android browsers, and iOS Safari.

## Overview

The `CropView` is a **separate, standalone component** — it does not modify or interfere with the `<Camera />` component in any way. The workflow is:

1. **Capture** a photo using `<Camera />` → `takePhoto()`
2. **Crop** it using `<CropView />` → the user drags/resizes the crop area
3. **Confirm** → `onCropComplete` fires with the cropped image

```
Camera (live stream) → takePhoto() → CropView (edit) → onCropComplete → Your app
```

---

## Quick Start

```tsx
import { useState, useRef } from 'react';
import { Camera, CameraRef, CropView, CropResult } from 'react-webcam-pro';

const App = () => {
  const camera = useRef<CameraRef>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [croppedPhoto, setCroppedPhoto] = useState<string | null>(null);

  // Step 3: Show the final cropped image
  if (croppedPhoto) {
    return (
      <div>
        <img src={croppedPhoto} alt="Cropped" />
        <button onClick={() => { setCroppedPhoto(null); setPhoto(null); }}>
          Take another
        </button>
      </div>
    );
  }

  // Step 2: Show the crop editor
  if (photo) {
    return (
      <CropView
        image={photo}
        onCropComplete={(result) => setCroppedPhoto(result.base64)}
        onCropCancel={() => setPhoto(null)}
      />
    );
  }

  // Step 1: Show the camera
  return (
    <div>
      <Camera ref={camera} />
      <button onClick={() => setPhoto(camera.current?.takePhoto() as string)}>
        📸 Take photo
      </button>
    </div>
  );
};
```

---

## How It Works

When the `CropView` renders:

1. The captured photo fills the viewport behind a **semi-transparent dark overlay**.
2. A **bright-bordered crop box** appears on top, showing the selected region at full brightness.
3. The user can:
   - **Drag** inside the box to reposition it
   - **Drag corner handles** to resize
   - **Drag edge handles** to resize on one axis
4. The bottom toolbar has **Cancel**, **Reset**, and **Crop** buttons.
5. Clicking **Crop** extracts the selected region using the Canvas API and returns it via `onCropComplete`.

### Cross-Platform Interactions

| Platform | Move | Resize |
|----------|------|--------|
| **Desktop** (Mac/Windows/Linux) | Mouse drag inside the crop box | Mouse drag on corner/edge handles |
| **Android** (Chrome/Firefox) | Touch drag inside the crop box | Touch drag on handles |
| **iOS** (Safari/Chrome) | Touch drag inside the crop box | Touch drag on handles |

All interactions use the [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events), which unifies mouse, touch, and pen input across all modern browsers.

---

## Props

### `image` (required)

| Type | Default |
|------|---------|
| `string` | — |

The image to crop, as a base64 data URL string. This is typically the return value of `camera.current.takePhoto()`.

```tsx
<CropView image={photoBase64} onCropComplete={handleCrop} />
```

### `onCropComplete` (required)

| Type | Default |
|------|---------|
| `(result: CropResult) => void` | — |

Called when the user clicks the "Crop" button. The `result` object contains:

```ts
interface CropResult {
  base64: string;      // Cropped image as JPEG data URL
  imgData: ImageData;  // Cropped image as raw pixel data
  cropArea: CropArea;  // The crop coordinates used (fractions 0–1)
}
```

### `onCropCancel`

| Type | Default |
|------|---------|
| `() => void` | `undefined` |

Called when the user clicks the "Cancel" button. Use this to go back to the camera.

### `cropAspectRatio`

| Type | Default |
|------|---------|
| `number` | `undefined` |

Locks the crop box to a specific aspect ratio. When set, resizing maintains the ratio.

```tsx
// Square crop
<CropView image={photo} cropAspectRatio={1} onCropComplete={handleCrop} />

// 16:9 crop
<CropView image={photo} cropAspectRatio={16 / 9} onCropComplete={handleCrop} />

// Free-form (default)
<CropView image={photo} onCropComplete={handleCrop} />
```

### `cropShape`

| Type | Default |
|------|---------|
| `'rect' \| 'circle'` | `'rect'` |

Visual shape of the crop mask. When set to `'circle'`, the overlay shows a circular mask. **Note:** the output image is still rectangular (the bounding box of the circle).

```tsx
// Circular crop for profile photos
<CropView image={photo} cropShape="circle" cropAspectRatio={1} onCropComplete={handleCrop} />
```

:::tip
Combine `cropShape="circle"` with `cropAspectRatio={1}` for a perfectly circular selection area.
:::

### `minCropSize`

| Type | Default |
|------|---------|
| `number` | `0.1` |

Minimum crop size as a fraction of the image dimensions (0–1). Prevents the user from making an extremely tiny selection.

### `labels`

| Type | Default |
|------|---------|
| `{ confirm?: string; cancel?: string; reset?: string }` | `{ confirm: 'Crop', cancel: 'Cancel', reset: 'Reset' }` |

Custom labels for the toolbar buttons:

```tsx
<CropView
  image={photo}
  onCropComplete={handleCrop}
  labels={{ confirm: 'Done', cancel: 'Back', reset: 'Undo' }}
/>
```

### `className` / `style`

| Type | Default |
|------|---------|
| `string` / `CSSProperties` | `undefined` |

CSS class name and inline styles for the outermost crop container. Useful for sizing/positioning the crop view:

```tsx
<CropView
  image={photo}
  onCropComplete={handleCrop}
  className="my-crop-editor"
  style={{ position: 'absolute', inset: 0 }}
/>
```

---

## Methods (via Ref)

The `CropView` can be controlled programmatically via a ref:

```tsx
import { useRef } from 'react';
import { CropView, CropViewRef } from 'react-webcam-pro';

const cropRef = useRef<CropViewRef>(null);

<CropView ref={cropRef} image={photo} onCropComplete={handleCrop} />

// Trigger crop programmatically
const result = cropRef.current.cropImage();

// Reset to initial crop area
cropRef.current.resetCrop();

// Read the current crop area
const area = cropRef.current.getCropArea();
// { x: 0.1, y: 0.1, width: 0.8, height: 0.8 }
```

### `cropImage()`

**Returns:** `CropResult`

Programmatically crops the image using the current crop area. Same result as clicking the "Crop" button.

### `resetCrop()`

**Returns:** `void`

Resets the crop area to the initial default (80% centered, or centered with aspect ratio).

### `getCropArea()`

**Returns:** `CropArea`

Returns the current crop area as fractional coordinates:

```ts
interface CropArea {
  x: number;      // Left offset (0–1)
  y: number;      // Top offset (0–1)
  width: number;  // Width (0–1)
  height: number; // Height (0–1)
}
```

---

## Types

All CropView types are exported from the package:

```tsx
import {
  CropView,
  CropViewProps,
  CropViewRef,
  CropArea,
  CropResult,
} from 'react-webcam-pro';
```

---

## Full Example

Here's a complete example with camera capture → crop → preview → download:

```tsx
import { useState, useRef, useCallback } from 'react';
import { Camera, CameraRef, CropView, CropResult } from 'react-webcam-pro';

const App = () => {
  const camera = useRef<CameraRef>(null);
  const [rawPhoto, setRawPhoto] = useState<string | null>(null);
  const [finalPhoto, setFinalPhoto] = useState<string | null>(null);

  const handleCapture = useCallback(() => {
    if (camera.current) {
      setRawPhoto(camera.current.takePhoto() as string);
    }
  }, []);

  const handleCropDone = useCallback((result: CropResult) => {
    setFinalPhoto(result.base64);
    setRawPhoto(null);
  }, []);

  const handleDownload = useCallback(() => {
    if (!finalPhoto) return;
    const link = document.createElement('a');
    link.href = finalPhoto;
    link.download = `photo-${Date.now()}.jpg`;
    link.click();
  }, [finalPhoto]);

  // Crop editor
  if (rawPhoto) {
    return (
      <CropView
        image={rawPhoto}
        cropAspectRatio={1}
        onCropComplete={handleCropDone}
        onCropCancel={() => setRawPhoto(null)}
      />
    );
  }

  // Preview
  if (finalPhoto) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <img src={finalPhoto} alt="Cropped" style={{ maxWidth: '100%', borderRadius: 8 }} />
        <div style={{ marginTop: 12 }}>
          <button onClick={handleDownload}>💾 Download</button>
          <button onClick={() => setFinalPhoto(null)}>📸 New photo</button>
        </div>
      </div>
    );
  }

  // Camera
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Camera ref={camera} aspectRatio={16 / 9} />
      <button
        onClick={handleCapture}
        style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}
      >
        📸 Capture & Crop
      </button>
    </div>
  );
};
```
