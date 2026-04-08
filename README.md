[![npm version][npm-badge]][npm-url]
<!-- [![npm downloads][downloads-badge]][npm-url] -->
[![license][license-badge]][license-url]
[![TypeScript][typescript-badge]][typescript-url]
[![React][react-badge]][react-url]
[![Docs][docs-badge]][docs-url]

# react-webcam-pro

Universal Camera component for React.

Designed with focus on Android and iOS cameras. Works with standard webcams as well.

🚀 **[Live Demo](https://react-webcam-pro.vercel.app/)**

See [browser compatibility](http://caniuse.com/#feat=stream).

> **Note:** WebRTC is only supported on secure connections (HTTPS). You can test and debug from `localhost` in Chrome (this doesn't work in Safari).

---

## 🔀 Fork Notice

**`react-webcam-pro`** is a community-maintained fork of [`react-camera-pro`](https://github.com/purple-technology/react-camera-pro) by [Purple Technology](https://github.com/purple-technology).

The original package has not been actively maintained for over 2 years, leaving many users with unresolved issues — including React 19 compatibility, styled-components warnings, and various bug fixes. Many of us personally needed these updates, so we decided to fork the project, fix the outstanding issues, and continue maintaining it for the community.

### 🙏 Acknowledgements

A huge **thank you** to the original creators and contributors of `react-camera-pro`:

- [**Martin Urban**](https://github.com/murbanowicz) — Original author
- [**Purple Technology**](https://github.com/purple-technology) — Original maintainers
- All the [contributors](https://github.com/purple-technology/react-camera-pro/graphs/contributors) who helped build and improve the original package

---

## ✨ What's New

### v1.2.0 — April 8, 2026

- ✅ **`<CropView />` component** — WhatsApp-style interactive crop after photo capture
- ✅ **Drag, resize, pinch** — Cross-platform crop interactions (desktop + mobile)
- ✅ **Aspect ratio lock** — Lock crop to 1:1, 16:9, 4:3, or free-form
- ✅ **Circle crop shape** — Visual circular crop mask (output still rectangular)
- ✅ **Ref-controlled** — `cropImage()`, `resetCrop()`, `getCropArea()` via ref
- ✅ **Zero new dependencies** — Uses native Canvas & Pointer Events APIs

👉 **[Full v1.2.0 release notes](https://amareshsm.github.io/react-webcam-pro/docs/releases/v1.2.0)**

### v1.1.0 — April 7, 2026

- ✅ **`videoConstraints` prop** — Control resolution, frame rate, and any `MediaTrackConstraints` ([#52](https://github.com/purple-technology/react-camera-pro/issues/52))
- ✅ **Mirrored photo capture** — `takePhoto({ mirror: true })` for selfie-correct photos ([#74](https://github.com/purple-technology/react-camera-pro/issues/74))
- ✅ **Fixed Firefox & iOS 15 crash** — `getCapabilities()` handled gracefully with developer warning ([#75](https://github.com/purple-technology/react-camera-pro/issues/75), [#77](https://github.com/purple-technology/react-camera-pro/issues/77))
- ✅ **Interactive example app** — Try all props live at [react-webcam-pro.vercel.app](https://react-webcam-pro.vercel.app/)

👉 **[Full v1.1.0 release notes](https://amareshsm.github.io/react-webcam-pro/docs/releases/v1.1.0)**

### v1.0.0 — April 6, 2026 *(Initial Release)*

- ✅ **React 19 support** — Works with React 16.8+, 17, 18, and 19
- ✅ **styled-components v6 support** — Compatible with both v5 and v6
- ✅ **Fixed DOM warnings** — No more `mirrored` and `aspectRatio` prop warnings ([#48](https://github.com/purple-technology/react-camera-pro/issues/48))
- ✅ **`errorMessages` is now truly optional** ([#63](https://github.com/purple-technology/react-camera-pro/issues/63))
- ✅ **`className` and `style` props** — Style the camera container easily ([#47](https://github.com/purple-technology/react-camera-pro/issues/47))
- ✅ **Fixed camera switching with `videoSourceDeviceId`** — Device selection works correctly in environment mode ([#62](https://github.com/purple-technology/react-camera-pro/issues/62), [#69](https://github.com/purple-technology/react-camera-pro/issues/69))
- ✅ **Proper test suite** — Jest + React Testing Library
- ✅ **Modern toolchain** — TypeScript 5, Rollup 4

👉 **[Full v1.0.0 release notes](https://amareshsm.github.io/react-webcam-pro/docs/releases/v1.0.0)** · **[All releases →](https://amareshsm.github.io/react-webcam-pro/docs/releases/changelog)**

---

## Features

- 📱 Mobile-friendly camera solution (tested on iOS and Android)
- 📐 Fully responsive video element
  - Cover your container or define aspect ratio (16/9, 4/3, 1/1, ...)
- 📸 Take photos as base64 JPEG or ImageData — with the same aspect ratio as the view
- 🪞 Mirror captured photos with `takePhoto({ mirror: true })`
- ✂️ **WhatsApp-style crop** with `<CropView />` — drag, resize, aspect ratio lock *(new in v1.2.0)*
- 🎛️ Custom video constraints via `videoConstraints` prop (resolution, fps, etc.)
- 🖥️ Works with standard webcams and other video input devices
- 🔄 Switch between user/environment cameras
- 🔦 Torch/flashlight support
- 🔢 Detect number of available cameras
- 🔮 Facing camera is mirrored, environment is not
- ⚡ Controlled via React [Ref](https://react.dev/learn/manipulating-the-dom-with-refs)
- 📝 Written in TypeScript

---

## Installation

```bash
npm install react-webcam-pro
```

> **Peer dependencies:** `react`, `react-dom`, and `styled-components` (v5 or v6).

📖 **Documentation:** [amareshsm.github.io/react-webcam-pro](https://amareshsm.github.io/react-webcam-pro/)  
🎮 **Try it live:** [react-webcam-pro.vercel.app](https://react-webcam-pro.vercel.app/)

---

## Quick Start

```tsx
import React, { useState, useRef } from "react";
import { Camera } from "react-webcam-pro";

const App = () => {
  const camera = useRef(null);
  const [image, setImage] = useState(null);

  return (
    <div>
      <Camera ref={camera} />
      <button onClick={() => setImage(camera.current.takePhoto())}>
        Take photo
      </button>
      <img src={image} alt="Taken photo" />
    </div>
  );
};

export default App;
```

---

## Props

| Prop                      | Type                                | Default        | Description                                                      |
| ------------------------- | ----------------------------------- | -------------- | ---------------------------------------------------------------- |
| `facingMode`              | `'user' \| 'environment'`          | `'user'`       | Default camera facing mode                                       |
| `aspectRatio`             | `'cover' \| number`                | `'cover'`      | Aspect ratio of the video (e.g. `16/9`, `4/3`)                   |
| `numberOfCamerasCallback` | `(numberOfCameras: number) => void` | `() => null`   | Called when the number of cameras changes                        |
| `videoSourceDeviceId`     | `string`                            | `undefined`    | Specific video device ID to use                                  |
| `videoConstraints`        | `MediaTrackConstraints`             | `undefined`    | Custom video constraints (resolution, fps, etc.) *(new in v1.1.0)* |
| `errorMessages`           | `object` (optional)                 | See below      | Custom error messages                                            |
| `videoReadyCallback`      | `() => void`                        | `() => null`   | Called when the video feed is ready                              |
| `className`               | `string`                            | `undefined`    | CSS class name for the container                                 |
| `style`                   | `React.CSSProperties`              | `undefined`    | Inline styles for the container                                  |

### Error Messages

All fields are optional. Defaults:

```ts
{
  noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
  permissionDenied: 'Permission denied. Please refresh and give camera permission.',
  switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
  canvas: 'Canvas is not supported.',
}
```

---

## Methods (via Ref)

| Method                              | Return Type               | Description                                                              |
| ----------------------------------- | ------------------------- | ------------------------------------------------------------------------ |
| `takePhoto(type?)`                  | `string \| ImageData`    | Takes a photo. `type` is `'base64url'` (default) or `'imgData'`          |
| `takePhoto(options?)`               | `string \| ImageData`    | Takes a photo with options. Pass `{ mirror: true }` for mirrored capture *(new in v1.1.0)* |
| `switchCamera()`                    | `'user' \| 'environment'` | Switches between front and back camera                                   |
| `getNumberOfCameras()`              | `number`                  | Returns the number of available cameras                                  |
| `toggleTorch()`                     | `boolean`                 | Toggles the torch/flashlight                                             |
| `torchSupported`                    | `boolean`                 | Whether the torch is supported                                           |

---

## CropView Component *(new in v1.2.0)*

A separate `<CropView />` component for WhatsApp-style interactive cropping. Use it after capturing a photo — it's fully independent from `<Camera />`.

### Quick Example

```tsx
import { Camera, CameraRef, CropView, CropResult } from "react-webcam-pro";

const App = () => {
  const camera = useRef<CameraRef>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cropped, setCropped] = useState<string | null>(null);

  if (cropped) return <img src={cropped} alt="Cropped" />;

  if (photo) {
    return (
      <CropView
        image={photo}
        cropAspectRatio={1}  // square lock (optional)
        onCropComplete={(result) => setCropped(result.base64)}
        onCropCancel={() => setPhoto(null)}
      />
    );
  }

  return (
    <div>
      <Camera ref={camera} />
      <button onClick={() => setPhoto(camera.current?.takePhoto() as string)}>
        📸 Capture
      </button>
    </div>
  );
};
```

### CropView Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `image` | `string` | **(required)** | Base64 data URL of the image to crop |
| `cropAspectRatio` | `number` | `undefined` | Lock crop to an aspect ratio (e.g. `1`, `16/9`). Free-form if omitted. |
| `cropShape` | `'rect' \| 'circle'` | `'rect'` | Visual crop shape (output is always rectangular) |
| `minCropSize` | `number` | `0.1` | Minimum crop size as fraction of image (0–1) |
| `onCropComplete` | `(result: CropResult) => void` | **(required)** | Called with the cropped image when confirmed |
| `onCropCancel` | `() => void` | `undefined` | Called when the user cancels |
| `labels` | `{ confirm?, cancel?, reset? }` | `Crop/Cancel/Reset` | Custom button labels |
| `className` | `string` | `undefined` | CSS class for the container |
| `style` | `CSSProperties` | `undefined` | Inline styles for the container |

### CropView Methods (via Ref)

| Method | Return Type | Description |
| ------ | ----------- | ----------- |
| `cropImage()` | `CropResult` | Programmatically trigger crop |
| `resetCrop()` | `void` | Reset crop area to default |
| `getCropArea()` | `CropArea` | Get current crop area (fractions 0–1) |

---

## Advanced Usage

### Switching Cameras

```tsx
const App = () => {
  const camera = useRef(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [image, setImage] = useState(null);

  return (
    <>
      <Camera
        ref={camera}
        numberOfCamerasCallback={setNumberOfCameras}
      />
      <img src={image} alt="Preview" />
      <button onClick={() => setImage(camera.current.takePhoto())}>
        📸 Take photo
      </button>
      <button
        hidden={numberOfCameras <= 1}
        onClick={() => camera.current.switchCamera()}
      >
        🔄 Switch camera
      </button>
    </>
  );
};
```

### Environment Camera

```tsx
<Camera ref={camera} facingMode="environment" />
```

### Custom Aspect Ratio

```tsx
<Camera ref={camera} aspectRatio={16 / 9} />
```

### Video Constraints *(new in v1.1.0)*

Use `videoConstraints` to request a specific resolution, frame rate, or any other `MediaTrackConstraints`:

```tsx
<Camera
  ref={camera}
  videoConstraints={{
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
  }}
/>
```

### Mirrored Photo Capture *(new in v1.1.0)*

By default, photos are captured unmirrored (correct for environment cameras). Pass `{ mirror: true }` to flip horizontally — useful for selfie cameras:

```tsx
// With type only (existing API)
const photo = camera.current.takePhoto('base64url');

// With options object (new in v1.1.0)
const mirroredPhoto = camera.current.takePhoto({ mirror: true });
const imgData = camera.current.takePhoto({ type: 'imgData', mirror: true });
```

### Using within an iframe

```html
<iframe src="https://example.com/camera" allow="camera;" />
```

---

## Migrating from `react-camera-pro`

1. **Install** `react-webcam-pro`:
   ```bash
   npm uninstall react-camera-pro
   npm install react-webcam-pro
   ```

2. **Update imports:**
   ```diff
   - import { Camera } from "react-camera-pro";
   + import { Camera } from "react-webcam-pro";
   ```

3. That's it! The API is fully backward compatible. You can now optionally remove the `errorMessages` prop if you were only passing it to avoid TypeScript errors.

---

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build
npm run build

# Lint
npm run lint

# Type check
npm run typecheck
```

---

## 🤝 Community & Support

We're actively working through the open issues inherited from the original `react-camera-pro` repository. Fixes are being rolled out steadily.

**Need something fixed urgently?** [Create an issue](https://github.com/amareshsm/react-webcam-pro/issues/new) in our repo — it will be taken up on high priority and addressed quickly.

- 🐛 **Report a bug:** [Open an issue](https://github.com/amareshsm/react-webcam-pro/issues/new)
- 💡 **Request a feature:** [Open an issue](https://github.com/amareshsm/react-webcam-pro/issues/new)
- 💬 **Discuss:** [GitHub Discussions](https://github.com/amareshsm/react-webcam-pro/discussions)

---

## Credits

- Original package: [`react-camera-pro`](https://github.com/purple-technology/react-camera-pro) by [Purple Technology](https://github.com/purple-technology)
- Camera template: [kasperkamperman.com](https://www.kasperkamperman.com/blog/camera-template/)
- Boilerplate reference: [Developing & Publishing React Component Library](https://medium.com/@xfor/developing-publishing-react-component-library-to-npm-styled-components-typescript-cc8274305f5a)

---

## License

MIT — See [LICENSE](./LICENSE) for details.

[npm-badge]: https://img.shields.io/npm/v/react-webcam-pro?style=flat-square&color=cb3837&logo=npm
[downloads-badge]: https://img.shields.io/npm/dw/react-webcam-pro?style=flat-square&color=cb3837&logo=npm
[license-badge]: https://img.shields.io/npm/l/react-webcam-pro?style=flat-square&color=blue
[typescript-badge]: https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white
[react-badge]: https://img.shields.io/badge/React-16.8--19-61dafb?style=flat-square&logo=react&logoColor=black
[docs-badge]: https://img.shields.io/badge/docs-live-brightgreen?style=flat-square&logo=github

[npm-url]: https://www.npmjs.com/package/react-webcam-pro
[license-url]: https://github.com/amareshsm/react-webcam-pro/blob/master/LICENSE
[typescript-url]: https://www.typescriptlang.org/
[react-url]: https://react.dev/
[docs-url]: https://amareshsm.github.io/react-webcam-pro/
