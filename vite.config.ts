
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel은 보통 '/'를 사용하고, GitHub Pages는 '/repo-name/'을 사용합니다.
// Vercel 환경인지 확인하여 base 경로를 결정합니다.
const isVercel = process.env.VERCEL === 'true';

export default defineConfig({
  plugins: [react()],
  base: isVercel ? '/' : '/SVIL-Homepage/',
  define: {
    // 필요한 특정 환경 변수만 주입하여 보안 경고를 해결합니다.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    chunkSizeWarningLimit: 1000, // 대형 라이브러리 사용 시 경고 수치 완화
  }
});
