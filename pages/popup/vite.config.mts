import { resolve } from 'node:path';
import { withPageConfig } from '@extension/vite-config';

const rootDir = resolve(import.meta.dirname);
const srcDir = resolve(rootDir, 'src');

export default withPageConfig({
  resolve: {
    alias: {
      '@src': srcDir,
    },
  },
  publicDir: resolve(rootDir, 'public'),
  define: {
    'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(process.env.VITE_OPENAI_API_KEY || ''),
    'import.meta.env.VITE_OPENAI_API_ENDPOINT': JSON.stringify(process.env.VITE_OPENAI_API_ENDPOINT || 'https://api.chatanywhere.tech'),
    'import.meta.env.VITE_CUBOX_API_URL': JSON.stringify(process.env.VITE_CUBOX_API_URL || ''),
  },
  build: {
    outDir: resolve(rootDir, '..', '..', 'dist', 'popup'),
  },
});
