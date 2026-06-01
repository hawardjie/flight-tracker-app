import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-side proxy for the OpenSky Network /states/all endpoint.
 *
 * Why this exists:
 *  - OpenSky only sends `Access-Control-Allow-Origin: https://opensky-network.org`,
 *    so the browser can never call it directly (CORS).
 *  - Vercel's edge rewrite to opensky-network.org fails with
 *    ROUTER_EXTERNAL_TARGET_CONNECTION_ERROR (OpenSky drops the edge IPs).
 *
 * This function runs on Vercel's Node.js runtime (AWS Lambda egress, a
 * different network path than the edge router) and forwards the request with a
 * real User-Agent, returning OpenSky's JSON unchanged.
 */

const OPENSKY_STATES_URL = 'https://opensky-network.org/api/states/all';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { lamin, lomin, lamax, lomax } = req.query;

  if (!lamin || !lomin || !lamax || !lomax) {
    res.status(400).json({ error: 'Missing bounding box params: lamin, lomin, lamax, lomax' });
    return;
  }

  const params = new URLSearchParams({
    lamin: String(lamin),
    lomin: String(lomin),
    lamax: String(lamax),
    lomax: String(lomax),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const upstream = await fetch(`${OPENSKY_STATES_URL}?${params}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'flight-tracker-app (+https://flightinfo.today)',
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `OpenSky API error: HTTP ${upstream.status}` });
      return;
    }

    const data = await upstream.json();

    // Cache briefly at the edge to smooth bursts and conserve OpenSky credits.
    // OpenSky serves data at ~10s resolution, so a 10s cache costs no freshness.
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');
    res.status(200).json(data);
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    res.status(502).json({
      error: aborted
        ? 'Upstream timeout - OpenSky API did not respond'
        : 'Failed to reach OpenSky API',
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
