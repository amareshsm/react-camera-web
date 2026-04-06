import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraRef } from 'react-webcam-pro';

/* ───────── Types ───────── */
interface Config {
  facingMode: 'user' | 'environment';
  aspectRatio: 'cover' | number;
  width: number;
  height: number;
  frameRate: number;
  mirrorPhoto: boolean;
  deviceId: string | undefined;
}

const DEFAULT_CONFIG: Config = {
  facingMode: 'user',
  aspectRatio: 'cover',
  width: 1920,
  height: 1080,
  frameRate: 30,
  mirrorPhoto: false,
  deviceId: undefined,
};

const ASPECT_RATIOS: { label: string; value: 'cover' | number }[] = [
  { label: 'Cover (fill)', value: 'cover' },
  { label: '16 : 9', value: 16 / 9 },
  { label: '4 : 3', value: 4 / 3 },
  { label: '1 : 1', value: 1 },
  { label: '21 : 9', value: 21 / 9 },
];

const RESOLUTIONS: { label: string; w: number; h: number }[] = [
  { label: '4K (3840×2160)', w: 3840, h: 2160 },
  { label: 'Full HD (1920×1080)', w: 1920, h: 1080 },
  { label: 'HD (1280×720)', w: 1280, h: 720 },
  { label: 'VGA (640×480)', w: 640, h: 480 },
  { label: 'QVGA (320×240)', w: 320, h: 240 },
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
  const [showPanel, setShowPanel] = useState(true);
  const [showPhoto, setShowPhoto] = useState(false);

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
    setShowPhoto(true);
  }, [config.mirrorPhoto]);

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

  const videoConstraints: MediaTrackConstraints = {
    width: { ideal: config.width },
    height: { ideal: config.height },
    frameRate: { ideal: config.frameRate },
  };

  return (
    <div style={styles.layout}>
      {/* ── Camera Area ── */}
      <div style={styles.cameraArea}>
        {showPhoto && photo ? (
          <div style={styles.photoPreview}>
            <img src={photo} alt="Captured" style={styles.photoImg} />
            <div style={styles.photoActions}>
              <button style={styles.photoBtn} onClick={handleDownload}>
                💾 Download
              </button>
              <button style={styles.photoBtn} onClick={() => setShowPhoto(false)}>
                ✕ Close
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
                noCameraAccessible: '📷 No camera found. Please connect a camera and refresh.',
                permissionDenied: '🔒 Camera permission denied. Please allow access and refresh.',
                switchCamera: '⚠️ Cannot switch — only one camera available.',
                canvas: '⚠️ Canvas not supported in this browser.',
              }}
            />

            {/* Floating action bar */}
            <div style={styles.actionBar}>
              <button
                style={styles.actionBtn}
                onClick={handleSwitchCamera}
                disabled={numberOfCameras < 2}
                title="Switch Camera"
              >
                🔄
              </button>
              <button style={styles.captureBtn} onClick={handleTakePhoto} title="Take Photo">
                📸
              </button>
              {camera.current?.torchSupported && (
                <button
                  style={{
                    ...styles.actionBtn,
                    ...(torchOn ? styles.actionBtnActive : {}),
                  }}
                  onClick={handleToggleTorch}
                  title="Toggle Torch"
                >
                  🔦
                </button>
              )}
              <button
                style={styles.actionBtn}
                onClick={() => setShowPanel((p) => !p)}
                title="Toggle Settings"
              >
                ⚙️
              </button>
            </div>

            {/* Status badge */}
            <div style={styles.statusBadge}>
              <span
                style={{
                  ...styles.statusDot,
                  backgroundColor: videoReady ? '#00c853' : '#ff5252',
                }}
              />
              {videoReady ? 'Live' : 'Starting…'}
              {numberOfCameras > 0 && ` · ${numberOfCameras} camera${numberOfCameras > 1 ? 's' : ''}`}
            </div>
          </>
        )}
      </div>

      {/* ── Settings Panel ── */}
      {showPanel && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>⚙️ Configuration</h2>
            <p style={styles.panelSubtitle}>
              Tweak camera settings below — changes apply in real-time.
            </p>
          </div>

          <div style={styles.panelBody}>
            {/* Facing Mode */}
            <SettingGroup label="Facing Mode">
              <div style={styles.btnGroup}>
                {(['user', 'environment'] as const).map((mode) => (
                  <button
                    key={mode}
                    style={{
                      ...styles.toggleBtn,
                      ...(config.facingMode === mode ? styles.toggleBtnActive : {}),
                    }}
                    onClick={() => updateConfig({ facingMode: mode })}
                  >
                    {mode === 'user' ? '🤳 User' : '🌍 Environment'}
                  </button>
                ))}
              </div>
            </SettingGroup>

            {/* Aspect Ratio */}
            <SettingGroup label="Aspect Ratio">
              <select
                style={styles.select}
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
                style={styles.select}
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
                style={styles.range}
              />
              <div style={styles.rangeLabels}>
                <span>5</span>
                <span>30</span>
                <span>60</span>
              </div>
            </SettingGroup>

            {/* Camera Device */}
            {devices.length > 0 && (
              <SettingGroup label="Camera Device">
                <select
                  style={styles.select}
                  value={config.deviceId || ''}
                  onChange={(e) => updateConfig({ deviceId: e.target.value || undefined })}
                >
                  <option value="">Auto-detect</option>
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 8)}…`}
                    </option>
                  ))}
                </select>
              </SettingGroup>
            )}

            {/* Mirror Photo */}
            <SettingGroup label="Mirror Captured Photo">
              <label style={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={config.mirrorPhoto}
                  onChange={(e) => updateConfig({ mirrorPhoto: e.target.checked })}
                  style={styles.checkbox}
                />
                <span>{config.mirrorPhoto ? '✅ Mirrored' : '➡️ Normal'}</span>
              </label>
              <p style={styles.hint}>
                Tip: Enable for selfies so text and faces aren't flipped.
              </p>
            </SettingGroup>

            <hr style={styles.divider} />

            {/* Live Code Preview */}
            <SettingGroup label="📋 Generated Props">
              <pre style={styles.codeBlock}>
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
              style={styles.resetBtn}
              onClick={() => {
                setConfig(DEFAULT_CONFIG);
                setVideoReady(false);
              }}
            >
              🔄 Reset to Defaults
            </button>
          </div>

          <div style={styles.panelFooter}>
            <a href="https://amareshsm.github.io/react-webcam-pro/" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              📖 Docs
            </a>
            <a href="https://www.npmjs.com/package/react-webcam-pro" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              📦 npm
            </a>
            <a href="https://github.com/amareshsm/react-webcam-pro" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              ⭐ GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

/* ───────── Sub-components ───────── */

const SettingGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={styles.settingGroup}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

/* ───────── Styles ───────── */
const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: '#0f0f0f',
  },
  cameraArea: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: '#000',
  },
  actionBar: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: 999,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)',
    zIndex: 10,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    color: '#fff',
  },
  actionBtnActive: {
    background: 'rgba(108,99,255,0.5)',
    borderColor: '#6c63ff',
  },
  captureBtn: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    border: '3px solid #fff',
    background: 'rgba(255,255,255,0.15)',
    fontSize: 28,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    color: '#fff',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    borderRadius: 999,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)',
    fontSize: 13,
    color: '#e8e8e8',
    zIndex: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  panel: {
    width: 340,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#1a1a2e',
    borderLeft: '1px solid #333355',
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '20px 20px 12px',
    borderBottom: '1px solid #333355',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },
  panelSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  panelBody: {
    flex: 1,
    overflowY: 'auto',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  panelFooter: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
    padding: '12px 20px',
    borderTop: '1px solid #333355',
    fontSize: 13,
  },
  footerLink: {
    color: '#6c63ff',
    textDecoration: 'none',
  },
  settingGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#ccc',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #333355',
    background: '#222240',
    color: '#e8e8e8',
    fontSize: 14,
    outline: 'none',
  },
  range: {
    width: '100%',
    accentColor: '#6c63ff',
  },
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#666',
  },
  btnGroup: {
    display: 'flex',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #333355',
    background: '#222240',
    color: '#e8e8e8',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleBtnActive: {
    background: '#6c63ff',
    borderColor: '#6c63ff',
    color: '#fff',
    fontWeight: 600,
  },
  switchLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    cursor: 'pointer',
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: '#6c63ff',
    cursor: 'pointer',
  },
  hint: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #333355',
    margin: '4px 0',
  },
  codeBlock: {
    background: '#0f0f1a',
    border: '1px solid #333355',
    borderRadius: 6,
    padding: 12,
    fontSize: 12,
    lineHeight: 1.5,
    overflow: 'auto',
    color: '#a5d6ff',
    fontFamily: '"Fira Code", "Consolas", monospace',
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  resetBtn: {
    padding: '10px 16px',
    borderRadius: 6,
    border: '1px solid #333355',
    background: '#222240',
    color: '#e8e8e8',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  photoPreview: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    zIndex: 20,
    gap: 16,
  },
  photoImg: {
    maxWidth: '95%',
    maxHeight: '80%',
    objectFit: 'contain',
    borderRadius: 8,
  },
  photoActions: {
    display: 'flex',
    gap: 12,
  },
  photoBtn: {
    padding: '10px 20px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: '#e8e8e8',
    fontSize: 14,
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
  },
};

export default App;
