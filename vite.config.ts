import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Dev-only stand-in for the Vercel serverless function (api/opensky.ts).
      // The browser calls /api/opensky?<bbox> (same origin); Vite forwards to
      // OpenSky's /states/all, mirroring the production proxy's behavior.
      '/api/opensky': {
        target: 'https://opensky-network.org/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/opensky/, '/states/all'),
      },
    },
  },
})
