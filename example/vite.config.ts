import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const useLocalLib = mode === 'development';

  const alias: Record<string, string> = {};

  if (useLocalLib) {
    // DEV: point at the local TypeScript source for instant feedback
    alias['react-webcam-pro'] = path.resolve(__dirname, '../src/index.ts');
  }

  return {
    plugins: [react()],
    resolve: { alias },
    server: {
      open: true,
    },
  };
});
