import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import React, { useCallback, useState } from 'react';

import styles from './index.module.css';

function CopyInstallCommand() {
  const [copied, setCopied] = useState(false);
  const command = 'npm install react-webcam-pro';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className={styles.heroInstall} onClick={handleCopy} title="Click to copy">
      <code className={styles.heroInstallCode}>
        <span className={styles.heroInstallPrompt}>$</span> {command}
      </code>
      <button className={styles.heroInstallCopy} aria-label="Copy to clipboard">
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}

function CameraLogo() {
  return (
    <svg
      className={styles.heroLogo}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="16" fill="url(#logo-gradient)" />
      <rect x="12" y="22" width="40" height="26" rx="4" fill="white" fillOpacity="0.95" />
      <circle cx="32" cy="35" r="8" fill="url(#logo-gradient)" />
      <circle cx="32" cy="35" r="4.5" fill="white" />
      <circle cx="32" cy="35" r="2" fill="url(#logo-gradient)" fillOpacity="0.6" />
      <rect x="24" y="16" width="16" height="8" rx="3" fill="white" fillOpacity="0.8" />
      <circle cx="45" cy="27" r="2" fill="url(#logo-gradient)" fillOpacity="0.5" />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={styles.heroGlow} />
      <div className="container">
        <div className={styles.heroBadge}>
          <span>✨ v1.1.0 — videoConstraints, Mirror Photos & Browser Fixes</span>
        </div>
        <div className={styles.heroTitleRow}>
          <CameraLogo />
          <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
            {siteConfig.title}
          </Heading>
        </div>
        <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
          {siteConfig.tagline}
        </p>
        <CopyInstallCommand />
        <div className={styles.buttons}>
          <Link
            className={clsx('button button--lg', styles.btnPrimary)}
            to="/docs/getting-started/installation"
          >
            Get Started
          </Link>
          <Link
            className={clsx('button button--lg', styles.btnSecondary)}
            to="/docs/api/props"
          >
            API Reference →
          </Link>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>React 16–19</span>
            <span className={styles.statLabel}>Supported</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>TypeScript</span>
            <span className={styles.statLabel}>First-class</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>0 deps</span>
            <span className={styles.statLabel}>Lightweight</span>
          </div>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  emoji: string;
  description: string;
  tag?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Mobile-First',
    emoji: '📱',
    description:
      'Designed with focus on iOS and Android cameras. Works perfectly with standard webcams too.',
  },
  {
    title: 'React 19 Ready',
    emoji: '⚛️',
    description:
      'Supports React 16.8+, 17, 18, and 19 out of the box. Compatible with styled-components v5 and v6.',
    tag: 'Updated',
  },
  {
    title: 'Video Constraints',
    emoji: '🎛️',
    description:
      'Control camera resolution, frame rate and any MediaTrackConstraints directly via the videoConstraints prop.',
    tag: 'New in v1.1',
  },
  {
    title: 'Mirror Photo Capture',
    emoji: '🪞',
    description:
      'Capture selfie-correct mirrored photos with takePhoto({ mirror: true }). Matches exactly what the user sees.',
    tag: 'New in v1.1',
  },
  {
    title: 'Full Control via Ref',
    emoji: '�',
    description:
      'Take photos, switch cameras, toggle torch, and more — all controlled via a simple React ref.',
  },
  {
    title: 'Drop-in Replacement',
    emoji: '🔄',
    description:
      'Best alternative to react-camera-pro. Just change the import — the API is 100% backward compatible.',
  },
];

function Feature({ title, emoji, description, tag }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx('feature-card', styles.featureCard)}>
        <div className={styles.featureEmoji}>{emoji}</div>
        <Heading as="h3">
          {title}
          {tag && <span className={styles.featureTag}>{tag}</span>}
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="text--center" style={{ marginBottom: '2.5rem' }}>
          <Heading as="h2" className={styles.sectionTitle}>
            Why react-webcam-pro?
          </Heading>
          <p className={styles.sectionSubtitle}>
            Everything you need to build camera experiences in React
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

const quickStartCode = `import { Camera } from 'react-webcam-pro';
import { useRef } from 'react';

const App = () => {
  const camera = useRef(null);

  return (
    <div>
      <Camera ref={camera} />
      <button onClick={() => camera.current.takePhoto()}>
        📸 Take photo
      </button>
    </div>
  );
};`;

function HomepageQuickStart() {
  return (
    <section className={styles.quickStart}>
      <div className="container">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <div className="text--center" style={{ marginBottom: '2rem' }}>
              <Heading as="h2" className={styles.sectionTitle}>
                Up and running in seconds
              </Heading>
              <p className={styles.sectionSubtitle}>
                Just a few lines of code to start capturing photos
              </p>
            </div>
            <div className={styles.codeBlock}>
              <CodeBlock language="tsx" title="App.tsx">
                {quickStartCode}
              </CodeBlock>
            </div>
            <div className="text--center" style={{ marginTop: '2rem' }}>
              <Link
                className={clsx('button button--lg', styles.btnPrimary)}
                to="/docs/getting-started/quick-start"
              >
                Read the full guide →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageCommunity() {
  return (
    <section className={styles.community}>
      <div className="container">
        <div className="text--center">
          <Heading as="h2" className={styles.sectionTitle}>
            🤝 Community-Maintained
          </Heading>
          <p className={styles.communityText}>
            We're actively working through the open issues inherited from the
            original <code>react-camera-pro</code> repository. If you encounter a
            bug or need a feature urgently, please{' '}
            <Link href="https://github.com/amareshsm/react-webcam-pro/issues/new">
              create an issue
            </Link>{' '}
            in our repo — it will be prioritized and addressed quickly.
          </p>
          <div className={styles.communityButtons}>
            <Link
              className={clsx('button button--lg', styles.btnSecondary)}
              href="https://github.com/amareshsm/react-webcam-pro/issues/new"
            >
              🐛 Report an Issue
            </Link>
            <Link
              className={clsx('button button--lg', styles.btnOutline)}
              href="https://github.com/amareshsm/react-webcam-pro"
            >
              ⭐ Star on GitHub
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} — React Camera Component | react-camera-pro Alternative`}
      description="react-webcam-pro: the maintained alternative to react-camera-pro. Universal camera component for React with React 19 support, videoConstraints, mirror photos, Firefox/iOS fixes, and 69 tests."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageQuickStart />
        <HomepageCommunity />
      </main>
    </Layout>
  );
}
