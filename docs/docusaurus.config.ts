import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'react-webcam-pro',
  tagline: 'Universal Camera component for React — iOS, Android & Webcams',
  favicon: 'img/favicon.ico',

  url: 'https://amareshsm.github.io',
  baseUrl: '/react-webcam-pro/',

  organizationName: 'amareshsm',
  projectName: 'react-webcam-pro',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',
  trailingSlash: false,

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content: 'react-webcam-pro, react-camera-pro, react-camera-pro alternative, react-camera-web, react webcam, react camera, camera component, webcam component, react19 camera, iOS camera react, Android camera react, getUserMedia react, webRTC react, video constraints react, mirror photo react, react camera component, react-camera-pro fork',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content: 'react-webcam-pro — The maintained alternative to react-camera-pro. Universal camera component for React 16–19 with videoConstraints, mirror photo capture, Firefox/iOS fixes, and full TypeScript support.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:title',
        content: 'react-webcam-pro — React Camera Component | react-camera-pro Alternative',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:description',
        content: 'The maintained alternative to react-camera-pro. Supports React 16–19, videoConstraints, mirror photo capture, Firefox/iOS fixes. Drop-in replacement — just change the import.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:url',
        content: 'https://amareshsm.github.io/react-webcam-pro/',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:title',
        content: 'react-webcam-pro — React Camera Component | react-camera-pro Alternative',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:description',
        content: 'The maintained alternative to react-camera-pro. React 19 ready, videoConstraints, mirror photos, Firefox/iOS fixes.',
      },
    },
  ],

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
        searchResultContextMaxLength: 50,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/amareshsm/react-webcam-pro/tree/master/docs/',
        },
        blog: false,
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: [],
          filename: 'sitemap.xml',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    navbar: {
      title: 'react-webcam-pro',
      logo: {
        alt: 'react-webcam-pro Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/releases/changelog',
          label: 'Releases',
          position: 'left',
        },
        {
          href: 'https://github.com/amareshsm/react-webcam-pro',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/react-webcam-pro',
          label: 'npm',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/installation',
            },
            {
              label: 'API Reference',
              to: '/docs/api/props',
            },
            {
              label: 'Guides',
              to: '/docs/guides/switching-cameras',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/amareshsm/react-webcam-pro/issues',
            },
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/amareshsm/react-webcam-pro/discussions',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Releases',
              to: '/docs/releases/changelog',
            },
            {
              label: 'Migration Guide',
              to: '/docs/migration/from-react-camera-pro',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/react-webcam-pro',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Amaresh. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'json', 'tsx', 'typescript'],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
