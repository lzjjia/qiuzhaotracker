import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 开发时把 /api 与 /uploads 代理到后端 3001 端口
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
});
