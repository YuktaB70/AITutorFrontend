import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/pdf': {
        target: 'https://aitutor-production-cb21.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
    }, 
  },
});
