import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import performanceAssets from './scripts/performance-assets.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    performanceAssets(),
    react(),
    tailwindcss(),
  ],
})
