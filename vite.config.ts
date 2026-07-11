import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const githubPagesBase = process.env.VITE_BASE_PATH || '/';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages user/organization site는 루트 경로('/')를 사용합니다.
  base: command === 'serve' ? '/' : githubPagesBase,
  define: {
    // 빌드 시점(dev 서버 실행 시점 포함) 날짜를 Footer에 표시하기 위한 상수
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
  }
}));
