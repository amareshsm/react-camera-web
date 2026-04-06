# Contributing to react-webcam-pro

Thank you for your interest in contributing! This guide will help you get started.

---

## 📋 Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/<your-username>/react-webcam-pro.git
cd react-webcam-pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Library

```bash
npm run build
```

This runs Rollup to compile TypeScript → `dist/`.

### 4. Run Tests

```bash
npm test
```

All 69 tests must pass before submitting a PR.

### 5. Type Check

```bash
npx tsc --noEmit
```

---

## 🏗 Project Structure

```
src/
  index.ts                    # Public API — exports Camera, CameraRef, etc.
  components/
    Camera/
      Camera.tsx              # Main component (forwardRef)
      types.ts                # TypeScript interfaces
      styles.ts               # styled-components
test/
  setup.ts                    # Mock MediaDevices for jsdom
  Camera.test.tsx             # Unit tests
  backward-compat.test.tsx    # Backward compatibility tests
example/                      # Vite + React demo app
docs/                         # Docusaurus documentation site
```

---

## 🔧 Development Workflow

### Running the Example App

```bash
cd example
npm install
npm run dev
```

Opens at `http://localhost:5173`. The example app uses the published npm package, so for local development you may want to temporarily change `react-webcam-pro` in `example/package.json` to `"file:.."` and rebuild.

### Running the Docs Site

```bash
cd docs
npm install
npm start
```

Opens at `http://localhost:3000`.

---

## ✅ Before Submitting a PR

1. **All tests pass:** `npm test`
2. **TypeScript compiles:** `npx tsc --noEmit`
3. **Build succeeds:** `npm run build`
4. **No lint errors:** `npm run lint` (if available)
5. **Write tests** for any new features or bug fixes
6. **Keep changes focused** — one feature or fix per PR

---

## 📝 Commit Message Convention

We use conventional-style commit messages:

```
feat: add videoConstraints prop for resolution control
fix: wrap getCapabilities in try/catch for Firefox/iOS 15
test: add tests for mirrored photo capture
docs: update README with new takePhoto options
chore: bump version to 1.1.0
```

---

## 🐛 Reporting Bugs

Use the [Bug Report template](https://github.com/amareshsm/react-webcam-pro/issues/new?template=bug_report.md) and include:

- Browser & version
- Device (desktop/mobile, OS)
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

---

## 💡 Feature Requests

Use the [Feature Request template](https://github.com/amareshsm/react-webcam-pro/issues/new?template=feature_request.md).

---

## 📜 Code Style

- TypeScript strict mode
- Functional components with hooks
- styled-components with `$` prefix for transient props (avoids DOM warnings)
- Keep the public API minimal and backward-compatible

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
