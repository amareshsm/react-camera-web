---
sidebar_position: 1
title: Changelog
description: All releases of react-webcam-pro.
---

# Changelog

All notable changes to `react-webcam-pro` are documented here.

This project follows [Semantic Versioning](https://semver.org/).

---

## [1.1.0](https://github.com/amareshsm/react-webcam-pro/releases/tag/v1.1.0) — 2026-04-07

**Resolution control, mirrored photos, and Firefox/iOS 15 fix.**

👉 [Full release notes →](/docs/releases/v1.1.0)

### ✨ Features

- **`videoConstraints` prop** — Control camera resolution, frame rate, and other `MediaTrackConstraints` directly.
- **Mirrored photo capture** — `takePhoto({ mirror: true })` captures a mirrored photo matching the user-facing preview.
- **`TakePhotoOptions` type export** — New options object for `takePhoto()`.
- **Interactive example app** — Full configuration panel to try all props live.

### 🐛 Bug Fixes

- **Fixed Firefox & iOS 15 crash** — `getCapabilities()` is now wrapped in try/catch with feature detection.
- **Developer-friendly warnings** — Changed silent error swallowing to `console.warn` so devs know what happened.

### 🧪 Tests

- Added 9 new tests (69 total) for all new features.
- Suppressed expected console noise in error-handling tests for cleaner output.

---

## [1.0.0](https://github.com/amareshsm/react-webcam-pro/releases/tag/v1.0.0) — 2026-04-06

**The first stable release of `react-webcam-pro`** — a community-maintained fork of `react-camera-pro`.

👉 [Full release notes →](/docs/releases/v1.0.0)

### ✨ Features

- **React 19 support** — Peer dependencies widened to support React 16.8+, 17, 18, and 19.
- **styled-components v6 support** — Peer dependencies support both v5 and v6.
- **`className` prop** — Apply CSS classes to the camera container.
- **`style` prop** — Apply inline styles to the camera container.
- **`CameraRef` type export** — Proper interface for typing the camera ref.
- **Optional `errorMessages`** — No longer required; defaults are used when not provided.
- **Comprehensive test suite** — 60+ tests covering all features and backward compatibility.

### 🐛 Bug Fixes

- **Fixed DOM warnings** — `mirrored` and `aspectRatio` no longer leak to the DOM (transient props).
- **Fixed `videoSourceDeviceId` priority** — Device ID selection now correctly takes priority over auto-detection in environment mode.
- **Removed deprecated WebRTC fallbacks** — Removed `navigator.getUserMedia` and vendor-prefixed variants.

### 🔧 Infrastructure

- Upgraded to **TypeScript 5.7** (from 3.7).
- Upgraded to **Rollup 4** (from 1.x) with `@rollup/plugin-typescript`.
- Added **Jest 29** + **React Testing Library 16** test infrastructure.
- Added comprehensive npm scripts: `test`, `test:watch`, `test:coverage`, `lint`, `format`, `typecheck`.
- Added proper `.gitignore` for `dist/`, `coverage/`, `*.tgz`.

### 📦 Dependencies

| Dependency | Before (react-camera-pro) | After (react-webcam-pro) |
|-----------|--------------------------|-------------------------|
| `react` peer | `^18.3.1` | `^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19` |
| `react-dom` peer | `^18.3.1` | `^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19` |
| `styled-components` peer | `^5.1.34` | `^5.0.0 \|\| ^6.0.0` |
| TypeScript | `3.7.5` | `5.7` |
| Rollup | `1.29` | `4.28` |

### 💔 Breaking Changes

**None.** This release is a drop-in replacement for `react-camera-pro`. See the [Migration Guide](/docs/migration/from-react-camera-pro).
