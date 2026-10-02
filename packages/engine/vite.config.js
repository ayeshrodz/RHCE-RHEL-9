import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import chapterWidgets from './plugins/chapter-widgets.js';
import contentBundle from './plugins/content-bundle.js';

export default defineConfig({
  // Relative asset paths + hash routing = works on any GitHub Pages sub-path.
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [contentBundle({ dir: '../../content' }), chapterWidgets(), react({ include: /\.(jsx|js)$/ })],
  server: { host: 'localhost', port: 3000 },
  // The site is built to the repository root's dist/, with the content bundle beside it.
  build: { outDir: '../../dist', emptyOutDir: true, chunkSizeWarningLimit: 900 },
});
