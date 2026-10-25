import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const proxy = {
  '/api': { target: process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:8080', changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { include: ['three', 'three/addons/utils/BufferGeometryUtils.js'] },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy,
    watch: { ignored: ['**/coverage/**', '**/test-results/**', '**/playwright-report/**'] },
  },
  preview: { port: 4173, strictPort: true, proxy },
  build: { sourcemap: false },
  test: {
    environment: 'jsdom',
    env: { VITE_APP_NAME: 'PrintLab' },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/test/**'],
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
