import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy OpenSky API requests to avoid browser CORS issues.
      // The browser calls /opensky-api/* (same origin); Vite forwards to the real API.
      '/opensky-api': {
        target: 'https://opensky-network.org/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opensky-api/, ''),
      },
      // Proxy Airplanes.live API requests to avoid browser CORS/403 blocks.
      '/airplanes-api': {
        target: 'https://api.airplanes.live',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/airplanes-api/, ''),
      },
    },
  },
})
