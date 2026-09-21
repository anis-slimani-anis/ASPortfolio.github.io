import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served by GitHub Pages at anisslimani.com/sncf-redesign/, built out of sncf-src/.
export default defineConfig({
  plugins: [react()],
  base: '/sncf-redesign/',
  build: {
    outDir: '../sncf-redesign',
    emptyOutDir: true,
  },
})
