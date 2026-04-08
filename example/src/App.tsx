import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraRef, CropView, CropResult } from 'react-webcam-pro';

/* ───────── Types ───────── */
interface Config {
  facingMode: 'user' | 'environment';
  aspectRatio: 'cover' | number;
  width: number;
  height: number;
  frameRate: number;
  mirrorPhoto: boolean;
  deviceId: string | undefined;
  cropEnabled: boolean;
  cropAspectRatio: 'free' | number;
  cropShape: 'rect' | 'circle';
}

const DEFAULT_CONFIG: Config = {
  facingMode: 'user',
  aspectRatio: 'cover',
  width: 1920,
  height: 1080,
  frameRate: 30,
  mirrorPhoto: false,
  deviceId: undefined,
  cropEnabled: true,
  cropAspectRatio: 'free',
  cropShape: 'rect',
};

const ASPECT_RATIOS: { label: string; value: 'cover' | number }[] = [
  { label: 'Cover (fill)', value: 'cover' },
  { label: '16 : 9', value: 16 / 9 },
  { label: '4 : 3', value: 4 / 3 },
  { label: '1 : 1', value: 1 },
  { label: '21 : 9', value: 21 / 9 },
];

const RESOLUTIONS: { label: string; w: number; h: number }[] = [
  { label: '4K (3840x2160)', w: 3840, h: 2160 },
  { label: 'Full HD (1920x1080)', w: 1920, h: 1080 },
  { label: 'HD (1280x720)', w: 1280, h: 720 },
  { label: 'VGA (640x480)', w: 640, h: 480 },
  { label: 'QVGA (320x240)', w: 320, h: 240 },
];

const CROP_ASPECT_RATIOS: { label: string; value: 'free' | number }[] = [
  { label: 'Free', value: 'free' },
  { label: '1 : 1 (Square)', value: 1 },
  { label: '16 : 9', value: 16 / 9 },
  { label: '4 : 3', value: 4 / 3 },
  { label: '9 : 16', value: 9 / 16 },
  { label: '3 : 4', value: 3 / 4 },
];

/* ───────── App ───────── */
const App: React.FC = () => {
  const camera = useRef<CameraRef>(null);

  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showCrop, setShowCrop] = useState(false);

  /* Start with panel open only on desktop */
  useEffect(() => {
    if (window.innerWidth >= 768) setShowPanel(true);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const all = await navigator.mediaDevices.enumerateDevices();
        setDevices(all.filter((d) => d.kind === 'videoinput'));
      } catch {
        // permission denied or no camera
      }
    })();
  }, []);

  const updateConfig = useCallback((partial: Partial<Config>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    setVideoReady(false);
  }, []);

  const handleTakePhoto = useCallback(() => {
    if (!camera.current) return;
    const result = camera.current.takePhoto({
      type: 'base64url',
      mirror: config.mirrorPhoto,
    });
    setPhoto(result as string);
    setShowPanel(false);
    if (config.cropEnabled) {
      setShowCrop(true);
    } else {
      setShowPhoto(true);
    }
  }, [config.mirrorPhoto, config.cropEnabled]);

  const handleSwitchCamera = useCallback(() => {
    if (!camera.current) return;
    const newMode = camera.current.switchCamera();
    updateConfig({ facingMode: newMode });
  }, [updateConfig]);

  const handleToggleTorch = useCallback(() => {
    if (!camera.current) return;
    const on = camera.current.toggleTorch();
    setTorchOn(on);
  }, []);

  const handleDownload = useCallback(() => {
    if (!photo) return;
    const link = document.createElement('a');
    link.href = photo;
    link.download = `react-webcam-pro-${Date.now()}.jpg`;
    link.click();
  }, [photo]);

  const handleCropComplete = useCallback((result: CropResult) => {
    setPhoto(result.base64);
    setShowCrop(false);
    setShowPhoto(true);
  }, []);

  const handleCropCancel = useCallback(() => {
    setShowCrop(false);
    setPhoto(null);
  }, []);

  const videoConstraints: MediaTrackConstraints = {
    width: { ideal: config.width },
    height: { ideal: config.height },
    frameRate: { ideal: config.frameRate },
  };

  return (
    <div className="app-layout">
      {/* Camera Area */}
      <div className="camera-area">
        {showCrop && photo ? (
          <CropView
            image={photo}
            cropAspectRatio={config.cropAspectRatio === 'free' ? undefined : config.cropAspectRatio}
            cropShape={config.cropShape}
            onCropComplete={handleCropComplete}
            onCropCancel={handleCropCancel}
            style={{ position: 'absolute', inset: 0, zIndex: 20 }}
          />
        ) : showPhoto && photo ? (
          <div className="photo-preview">
            <img src={photo} alt="Captured" className="photo-img" />
            <div className="photo-actions">
              <button className="photo-btn" onClick={handleDownload}>
                Save
              </button>
              <button className="photo-btn" onClick={() => setShowPhoto(false)}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <Camera
              ref={camera}
              facingMode={config.facingMode}
              aspectRatio={config.aspectRatio}
              videoSourceDeviceId={config.deviceId}
              videoConstraints={videoConstraints}
              numberOfCamerasCallback={setNumberOfCameras}
              videoReadyCallback={() => setVideoReady(true)}
              errorMessages={{
                noCameraAccessible: 'No camera found. Please connect a camera and refresh.',
                permissionDenied: 'Camera permission denied. Please allow access and refresh.',
                switchCamera: 'Cannot switch - only one camera available.',
                canvas: 'Canvas not supported in this browser.',
              }}
            />

            {/* Floating action bar */}
            <div className="action-bar">
              <button
                className="action-btn"
                onClick={handleSwitchCamera}
                disabled={numberOfCameras < 2}
                title="Switch Camera"
              >
                <span className="action-icon">&#x1F504;</span>
              </button>
              <button className="capture-btn" onClick={handleTakePhoto} title="Take Photo">
                <span className="action-icon">&#x1F4F8;</span>
              </button>
              {camera.current?.torchSupported && (
                <button
                  className={`action-btn${torchOn ? ' active' : ''}`}
                  onClick={handleToggleTorch}
                  title="Toggle Torch"
                >
                  <span className="action-icon">&#x1F526;</span>
                </button>
              )}
              <button
                className={`action-btn${showPanel ? ' active' : ''}`}
                onClick={() => setShowPanel((p) => !p)}
                title="Toggle Settings"
              >
                <span className="action-icon">&#x2699;&#xFE0F;</span>
              </button>
            </div>

            {/* Status badge */}
            <div className="status-badge">
              <span
                className="status-dot"
                style={{ backgroundColor: videoReady ? '#00c853' : '#ff5252' }}
              />
              {videoReady ? 'Live' : 'Starting...'}
              {numberOfCameras > 0 && ` | ${numberOfCameras} cam${numberOfCameras > 1 ? 's' : ''}`}
            </div>
          </>
        )}
      </div>

      {/* Backdrop for mobile panel */}
      {showPanel && <div className="panel-backdrop" onClick={() => setShowPanel(false)} />}

      {/* Settings Panel */}
      <div className={`panel${showPanel ? ' panel--open' : ' panel--closed'}`}>
        {/* Drag handle (visual cue) */}
        <div className="panel-handle-bar" onClick={() => setShowPanel(false)}>
          <div className="panel-handle" />
        </div>

        <div className="panel-header">
          <div className="panel-header-row">
            <h2 className="panel-title">Configuration</h2>
            <button className="panel-close-btn" onClick={() => setShowPanel(false)}>
              &#x2715;
            </button>
          </div>
          <p className="panel-subtitle">
            Tweak camera settings &mdash; changes apply in real-time.
          </p>
        </div>

        <div className="panel-body">
          {/* Facing Mode */}
          <SettingGroup label="Facing Mode">
            <div className="btn-group">
              {(['user', 'environment'] as const).map((mode) => (
                <button
                  key={mode}
                  className={`toggle-btn${config.facingMode === mode ? ' active' : ''}`}
                  onClick={() => updateConfig({ facingMode: mode })}
                >
                  {mode === 'user' ? 'User' : 'Environment'}
                </button>
              ))}
            </div>
          </SettingGroup>

          {/* Aspect Ratio */}
          <SettingGroup label="Aspect Ratio">
            <select
              className="setting-select"
              value={typeof config.aspectRatio === 'number' ? config.aspectRatio.toString() : 'cover'}
              onChange={(e) =>
                updateConfig({
                  aspectRatio: e.target.value === 'cover' ? 'cover' : parseFloat(e.target.value),
                })
              }
            >
              {ASPECT_RATIOS.map((ar) => (
                <option key={ar.label} value={typeof ar.value === 'number' ? ar.value.toString() : 'cover'}>
                  {ar.label}
                </option>
              ))}
            </select>
          </SettingGroup>

          {/* Resolution */}
          <SettingGroup label="Resolution">
            <select
              className="setting-select"
              value={`${config.width}x${config.height}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number);
                updateConfig({ width: w, height: h });
              }}
            >
              {RESOLUTIONS.map((r) => (
                <option key={r.label} value={`${r.w}x${r.h}`}>
                  {r.label}
                </option>
              ))}
            </select>
          </SettingGroup>

          {/* Frame Rate */}
          <SettingGroup label={`Frame Rate: ${config.frameRate} fps`}>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={config.frameRate}
              onChange={(e) => updateConfig({ frameRate: parseInt(e.target.value, 10) })}
              className="setting-range"
            />
            <div className="range-labels">
              <span>5</span>
              <span>30</span>
              <span>60</span>
            </div>
          </SettingGroup>

          {/* Camera Device */}
          {devices.length > 0 && (
            <SettingGroup label="Camera Device">
              <select
                className="setting-select"
                value={config.deviceId || ''}
                onChange={(e) => updateConfig({ deviceId: e.target.value || undefined })}
              >
                <option value="">Auto-detect</option>
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.slice(0, 8)}...`}
                  </option>
                ))}
              </select>
            </SettingGroup>
          )}

          {/* Mirror Photo */}
          <SettingGroup label="Mirror Captured Photo">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={config.mirrorPhoto}
                onChange={(e) => updateConfig({ mirrorPhoto: e.target.checked })}
                className="setting-checkbox"
              />
              <span>{config.mirrorPhoto ? 'Mirrored' : 'Normal'}</span>
            </label>
            <p className="hint">
              Tip: Enable for selfies so text and faces are not flipped.
            </p>
          </SettingGroup>

          <hr className="setting-divider" />

          {/* Crop Settings */}
          <SettingGroup label="Crop After Capture">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={config.cropEnabled}
                onChange={(e) => updateConfig({ cropEnabled: e.target.checked })}
                className="setting-checkbox"
              />
              <span>{config.cropEnabled ? 'Enabled' : 'Disabled'}</span>
            </label>
            <p className="hint">
              When enabled, a WhatsApp-style crop screen appears after taking a photo.
            </p>
          </SettingGroup>

          {config.cropEnabled && (
            <>
              <SettingGroup label="Crop Aspect Ratio">
                <select
                  className="setting-select"
                  value={config.cropAspectRatio === 'free' ? 'free' : config.cropAspectRatio.toString()}
                  onChange={(e) =>
                    updateConfig({
                      cropAspectRatio: e.target.value === 'free' ? 'free' : parseFloat(e.target.value),
                    })
                  }
                >
                  {CROP_ASPECT_RATIOS.map((ar) => (
                    <option key={ar.label} value={typeof ar.value === 'number' ? ar.value.toString() : 'free'}>
                      {ar.label}
                    </option>
                  ))}
                </select>
              </SettingGroup>

              <SettingGroup label="Crop Shape">
                <div className="btn-group">
                  {(['rect', 'circle'] as const).map((shape) => (
                    <button
                      key={shape}
                      className={`toggle-btn${config.cropShape === shape ? ' active' : ''}`}
                      onClick={() => updateConfig({ cropShape: shape })}
                    >
                      {shape === 'rect' ? 'Rectangle' : 'Circle'}
                    </button>
                  ))}
                </div>
              </SettingGroup>
            </>
          )}

          <hr className="setting-divider" />

          {/* Live Code Preview */}
          <SettingGroup label="Generated Props">
            <pre className="code-block">
{`<Camera
  facingMode="${config.facingMode}"
  aspectRatio={${typeof config.aspectRatio === 'number' ? config.aspectRatio.toFixed(4) : '"cover"'}}
  videoConstraints={{
    width: { ideal: ${config.width} },
    height: { ideal: ${config.height} },
    frameRate: { ideal: ${config.frameRate} },
  }}${config.mirrorPhoto ? '\n  // takePhoto({ mirror: true })' : ''}${config.deviceId ? `\n  videoSourceDeviceId="${config.deviceId}"` : ''}
/>`}
            </pre>
          </SettingGroup>

          {/* Reset */}
          <button
            className="reset-btn"
            onClick={() => {
              setConfig(DEFAULT_CONFIG);
              setVideoReady(false);
            }}
          >
            Reset to Defaults
          </button>
        </div>

        <div className="panel-footer">
          <a href="https://amareshsm.github.io/react-webcam-pro/" target="_blank" rel="noopener noreferrer" className="footer-link">
            Docs
          </a>
          <a href="https://www.npmjs.com/package/react-webcam-pro" target="_blank" rel="noopener noreferrer" className="footer-link">
            npm
          </a>
          <a href="https://github.com/amareshsm/react-webcam-pro" target="_blank" rel="noopener noreferrer" className="footer-link">
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

/* ───────── Sub-components ───────── */

const SettingGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="setting-group">
    <label className="setting-label">{label}</label>
    {children}
  </div>
);

export default App;
