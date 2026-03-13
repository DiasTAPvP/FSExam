/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5208',
        changeOrigin: true,
        secure: false,
        ws: false,
        timeout: 0,
        proxyTimeout: 0
      }
    }
  }
})
