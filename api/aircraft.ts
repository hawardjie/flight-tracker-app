import type { VercelRequest, VercelResponse } from '@vercel/node';

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
 *
 * NOTE: the sweep module is loaded via dynamic import() INSIDE the handler so
 * that any module-resolution/runtime error is caught and surfaced in the HTTP
 * response body instead of crashing the function at load (which Vercel reports
 * only as an opaque 500 FUNCTION_INVOCATION_FAILED).
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { sweepUSAircraft } = await import('../lib/airplanesSweep');
    const result = await sweepUSAircraft();

    // The sweep takes ~45s and the underlying data updates frequently, so cache
    // briefly at the edge to absorb bursts while keeping the feed fresh.
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=60');
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('[api/aircraft] failed:', message, stack);
    res.status(502).json({ error: `Failed to sweep Airplanes.live: ${message}`, stack });
  }
}
