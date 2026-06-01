import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sweepUSAircraft } from '../lib/airplanesSweep';

/**
 * Server-side US aircraft feed backed by Airplanes.live.
 *
 * Airplanes.live's /point endpoint caps the radius at 250 nm, so covering the
 * continental US needs a sweep of overlapping tiles (see lib/airplanesSweep.ts).
 * Running that sweep here means the browser makes ONE request while the tiling
 * and rate limiting stay hidden on the server.
 *
 * Runs on Vercel's Node.js runtime (Lambda egress). Airplanes.live is reachable
 * from Vercel infrastructure, unlike OpenSky which blocks the cloud IP ranges.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const result = await sweepUSAircraft();

    // The sweep takes ~45s and the underlying data updates frequently, so cache
    // briefly at the edge to absorb bursts while keeping the feed fresh.
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=60');
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(502).json({ error: `Failed to sweep Airplanes.live: ${message}` });
  }
}
