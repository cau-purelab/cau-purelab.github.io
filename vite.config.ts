import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const githubPagesBase = process.env.VITE_BASE_PATH || '/';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages user/organization site는 루트 경로('/')를 사용합니다.
  base: command === 'serve' ? '/' : githubPagesBase,
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
  }
}));
