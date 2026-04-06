![npm][npm-badge]
![downloads][downloads-badge]
![license][license-badge]

# react-camera-web

Universal Camera component for React.

Designed with focus on Android and iOS cameras. Works with standard webcams as well.

See [browser compatibility](http://caniuse.com/#feat=stream).

> **Note:** WebRTC is only supported on secure connections (HTTPS). You can test and debug from `localhost` in Chrome (this doesn't work in Safari).

---

## 🔀 Fork Notice

**`react-camera-web`** is a community-maintained fork of [`react-camera-pro`](https://github.com/purple-technology/react-camera-pro) by [Purple Technology](https://github.com/purple-technology).

The original package has not been actively maintained for over 2 years, leaving many users with unresolved issues — including React 19 compatibility, styled-components warnings, and various bug fixes. Many of us personally needed these updates, so we decided to fork the project, fix the outstanding issues, and continue maintaining it for the community.

### 🙏 Acknowledgements

A huge **thank you** to the original creators and contributors of `react-camera-pro`:

- [**Martin Urban**](https://github.com/murbanowicz) — Original author
- [**Purple Technology**](https://github.com/purple-technology) — Original maintainers
- All the [contributors](https://github.com/purple-technology/react-camera-pro/graphs/contributors) who helped build and improve the original package

---

## ✨ What's New in `react-camera-web`

- ✅ **React 19 support** — Works with React 16.8+, 17, 18, and 19
- ✅ **styled-components v6 support** — Compatible with both v5 and v6
- ✅ **Fixed DOM warnings** — No more `mirrored` and `aspectRatio` prop warnings ([#48](https://github.com/purple-technology/react-camera-pro/issues/48))
- ✅ **`errorMessages` is now truly optional** ([#63](https://github.com/purple-technology/react-camera-pro/issues/63))
- ✅ **`className` and `style` props** — Style the camera container easily ([#47](https://github.com/purple-technology/react-camera-pro/issues/47))
- ✅ **Fixed camera switching with `videoSourceDeviceId`** — Device selection now works correctly in environment mode ([#62](https://github.com/purple-technology/react-camera-pro/issues/62), [#69](https://github.com/purple-technology/react-camera-pro/issues/69))
- ✅ **Proper test suite** — Jest + React Testing Library
- ✅ **Modern toolchain** — TypeScript 5, Rollup 4, and up-to-date dev dependencies

---

## Features

- 📱 Mobile-friendly camera solution (tested on iOS and Android)
- 📐 Fully responsive video element
  - Cover your container or define aspect ratio (16/9, 4/3, 1/1, ...)
- 📸 Take photos as base64 JPEG or ImageData — with the same aspect ratio as the view
- 🖥️ Works with standard webcams and other video input devices
- 🔄 Switch between user/environment cameras
- 🔦 Torch/flashlight support
- 🔢 Detect number of available cameras
- 🪞 Facing camera is mirrored, environment is not
- 🎛️ Controlled via React [Ref](https://react.dev/learn/manipulating-the-dom-with-refs)
- 📝 Written in TypeScript

---

## Installation

```bash
npm install react-camera-web
```

> **Peer dependencies:** `react`, `react-dom`, and `styled-components` (v5 or v6).

---

## Quick Start

```tsx
import React, { useState, useRef } from "react";
import { Camera } from "react-camera-web";

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

| Prop                      | Type                             | Default        | Description                                      |
| ------------------------- | -------------------------------- | -------------- | ------------------------------------------------ |
| `facingMode`              | `'user' \| 'environment'`       | `'user'`       | Default camera facing mode                       |
| `aspectRatio`             | `'cover' \| number`             | `'cover'`      | Aspect ratio of the video (e.g. `16/9`, `4/3`)   |
| `numberOfCamerasCallback` | `(numberOfCameras: number) => void` | `() => null` | Called when the number of cameras changes        |
| `videoSourceDeviceId`     | `string`                         | `undefined`    | Specific video device ID to use                  |
| `errorMessages`           | `object` (optional)              | See below      | Custom error messages                            |
| `videoReadyCallback`      | `() => void`                     | `() => null`   | Called when the video feed is ready               |
| `className`               | `string`                         | `undefined`    | CSS class name for the container                 |
| `style`                   | `React.CSSProperties`           | `undefined`    | Inline styles for the container                  |

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

| Method                | Return Type              | Description                                  |
| --------------------- | ------------------------ | -------------------------------------------- |
| `takePhoto(type?)`    | `string \| ImageData`   | Takes a photo. Default type is `'base64url'` |
| `switchCamera()`      | `'user' \| 'environment'` | Switches between front and back camera      |
| `getNumberOfCameras()` | `number`                | Returns the number of available cameras      |
| `toggleTorch()`       | `boolean`               | Toggles the torch/flashlight                 |
| `torchSupported`      | `boolean`               | Whether the torch is supported               |

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

### Using within an iframe

```html
<iframe src="https://example.com/camera" allow="camera;" />
```

---

## Migrating from `react-camera-pro`

1. **Install** `react-camera-web`:
   ```bash
   npm uninstall react-camera-pro
   npm install react-camera-web
   ```

2. **Update imports:**
   ```diff
   - import { Camera } from "react-camera-pro";
   + import { Camera } from "react-camera-web";
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

**Need something fixed urgently?** [Create an issue](https://github.com/amareshsm/react-camera-web/issues/new) in our repo — it will be taken up on high priority and addressed quickly.

- 🐛 **Report a bug:** [Open an issue](https://github.com/amareshsm/react-camera-web/issues/new)
- 💡 **Request a feature:** [Open an issue](https://github.com/amareshsm/react-camera-web/issues/new)
- 💬 **Discuss:** [GitHub Discussions](https://github.com/amareshsm/react-camera-web/discussions)

---

## Credits

- Original package: [`react-camera-pro`](https://github.com/purple-technology/react-camera-pro) by [Purple Technology](https://github.com/purple-technology)
- Camera template: [kasperkamperman.com](https://www.kasperkamperman.com/blog/camera-template/)
- Boilerplate reference: [Developing & Publishing React Component Library](https://medium.com/@xfor/developing-publishing-react-component-library-to-npm-styled-components-typescript-cc8274305f5a)

---

## License

MIT — See [LICENSE](./LICENSE) for details.

[downloads-badge]: https://img.shields.io/npm/dw/react-camera-web.svg?style=flat-square
[npm-badge]: https://img.shields.io/npm/v/react-camera-web?style=flat-square
[license-badge]: https://img.shields.io/npm/l/react-camera-web?style=flat-square
