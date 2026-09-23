import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served by GitHub Pages at anisslimani.com/sncf/, built out of sncf-src/.
export default defineConfig({
  plugins: [react()],
  base: '/sncf/',
  build: {
    outDir: '../sncf',
    emptyOutDir: true,
  },
})
