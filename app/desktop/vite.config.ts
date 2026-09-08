import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  clearScreen: false,
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('..', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
  css: { postcss: { plugins: [tailwindcss()] } },
  server: { host: '127.0.0.1', port: 1420, strictPort: true, watch: { ignored: ['**/src-tauri/**'] } },
  preview: { host: '127.0.0.1', port: 1421, strictPort: true },
  build: { target: 'es2022', outDir: 'dist', emptyOutDir: true },
});
