import { defineConfig } from 'vite'

export default defineConfig({
  base: '/antivus-colonial/backend/v1.0/',
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../server/public',
    emptyOutDir: true
  }
})