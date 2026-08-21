import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/furniture-app/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5197',
        changeOrigin: true,
      },
    },
  },
})
