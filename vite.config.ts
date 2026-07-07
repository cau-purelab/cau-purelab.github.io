import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const githubPagesBase = process.env.VITE_BASE_PATH || '/pure-homepage/';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages 프로젝트 사이트는 저장소 이름을 base path로 사용합니다.
  base: command === 'serve' ? '/' : githubPagesBase,
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
  }
}));
