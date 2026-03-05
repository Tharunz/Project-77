import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'maps-vendor': ['react-simple-maps', 'd3-geo'],
          'icons-vendor': ['react-icons'],
          'charts-vendor': ['recharts'],
        }
      }
    },
    chunkSizeWarningLimit: 800,
  }
})
