import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api/props',
        'api/methods',
        'api/types',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'guides/switching-cameras',
        'guides/aspect-ratio',
        'guides/error-handling',
        'guides/torch',
        'guides/device-selection',
        'guides/styling',
        'guides/iframe-usage',
      ],
    },
    {
      type: 'category',
      label: 'Migration',
      collapsed: false,
      items: ['migration/from-react-camera-pro'],
    },
    {
      type: 'category',
      label: 'Releases',
      collapsed: false,
      items: [
        'releases/changelog',
        'releases/v1.1.0',
        'releases/v1.0.0',
      ],
    },
    'community',
  ],
};

export default sidebars;
