import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel 환경에서는 process.env.VERCEL이 '1'로 설정됨
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

export default defineConfig({
  plugins: [react()],
  // Vercel 배포 시에는 루트(/) 경로, GitHub Pages는 레포지토리 이름 경로 사용
  // GitHub URL: https://github.com/cheonbung/security-visual-intelligence-lab-home
  base: isVercel ? '/' : '/security-visual-intelligence-lab-home/',
  define: {
    // 클라이언트 사이드에서 process.env.API_KEY 접근 허용
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
  }
});
