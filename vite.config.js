import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../backend/dist'), // build frontend into backend/dist
    emptyOutDir: true,
  },
  server: {
    port: 5173, // for local dev
    proxy: {
      '/api': 'http://localhost:5000', // backend API proxy for dev
    },
  },
})
