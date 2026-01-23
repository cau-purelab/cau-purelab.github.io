
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/SVIL-Homepage/',
  define: {
    'process.env': process.env
  }
});
