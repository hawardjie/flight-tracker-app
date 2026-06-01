import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { sweepUSAircraft } from './lib/airplanesSweep'

// Dev-only stand-in for the Vercel serverless function (api/aircraft.ts).
// The browser calls /api/aircraft (same origin); this handler runs the identical
// server-side Airplanes.live sweep so local dev mirrors production.
const aircraftApiPlugin = (): Plugin => ({
  name: 'aircraft-api-dev',
  configureServer(server) {
    server.middlewares.use('/api/aircraft', async (_req, res) => {
      try {
        const result = await sweepUSAircraft()
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: `Failed to sweep Airplanes.live: ${message}` }))
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), aircraftApiPlugin()],
  server: {
    port: 3000,
    open: true,
  },
})
