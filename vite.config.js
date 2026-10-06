import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  envDir: '..',
  build: { outDir: '../dist', emptyOutDir: true },
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:5080' } },
  preview: { port: 4173, proxy: { '/api': 'http://127.0.0.1:5080' } },
});
