/**
 * Server-side Airplanes.live US sweep.
 *
 * Airplanes.live's /point/{lat}/{lon}/{radius} endpoint caps radius at 250 nm,
 * so covering the continental US requires multiple overlapping tiles. Doing the
 * sweep server-side (here) means the browser makes a single request while the
 * rate limiting and tiling stay hidden.
 *
 * This module is intentionally framework-agnostic (uses global fetch) so it can
 * run both inside the Vercel serverless function (api/aircraft.ts) and inside
 * the Vite dev server plugin (vite.config.ts).
 */

const AIRPLANES_LIVE_BASE = 'https://api.airplanes.live/v2';

// Airplanes.live hard cap on the point radius.
const RADIUS_NM = 250;

// Continental US bounds.
const LAT_MIN = 24.5;
const LAT_MAX = 49.0;
const LON_MIN = -125.0;
const LON_MAX = -66.0;

// Tile spacing in degrees. ~6.5 deg lat and ~7 deg lon keep the 250 nm circles
// overlapping enough to cover the US (~36 tiles) while leaving headroom to
// complete a full sweep inside Vercel's function time limit.
const LAT_STEP = 6.5;
const LON_STEP = 7.0;

// Polite pacing between requests. Combined with each request's own latency this
// keeps the effective rate under Airplanes.live's 1 req/sec guidance.
const REQUEST_DELAY_MS = 300;

// Hard wall-clock budget for the whole sweep. Vercel functions are capped
// (60s on Hobby), so we stop early and return whatever we've collected rather
// than getting killed mid-flight.
const TIME_BUDGET_MS = 52000;

// If a tile is rate limited, back off this long before continuing.
const RATE_LIMIT_BACKOFF_MS = 2000;

export interface AirplanesLiveAircraft {
  hex: string;
  type?: string;
  flight?: string;
  r?: string;
  t?: string;
  alt_baro?: number;
  alt_geom?: number;
  gs?: number;
  track?: number;
  true_heading?: number;
  mag_heading?: number;
  baro_rate?: number;
  geom_rate?: number;
  squawk?: string;
  lat?: number;
  lon?: number;
  seen_pos?: number;
  [key: string]: unknown;
}

interface AirplanesLivePointResponse {
  ac?: AirplanesLiveAircraft[];
  total?: number;
  now?: number;
}

export interface SweepResult {
  ac: AirplanesLiveAircraft[];
  total: number;
  now: number;
  tiles: number;
  tilesFetched: number;
  partial: boolean;
}

interface Tile {
  lat: number;
  lon: number;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Generate the grid of tile centers covering the continental US.
 */
export const generateUSTiles = (): Tile[] => {
  const tiles: Tile[] = [];
  for (let lat = LAT_MIN; lat <= LAT_MAX + 0.001; lat += LAT_STEP) {
    const rowLat = Math.min(lat, LAT_MAX);
    for (let lon = LON_MIN; lon <= LON_MAX + 0.001; lon += LON_STEP) {
      const colLon = Math.min(lon, LON_MAX);
      tiles.push({ lat: rowLat, lon: colLon });
    }
  }
  return tiles;
};

const fetchTile = async (tile: Tile): Promise<AirplanesLiveAircraft[] | 'rate-limited'> => {
  const url = `${AIRPLANES_LIVE_BASE}/point/${tile.lat}/${tile.lon}/${RADIUS_NM}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'flight-tracker-app (+https://flightinfo.today)',
    },
  });

  if (response.status === 429) {
    return 'rate-limited';
  }
  if (!response.ok) {
    // Skip this tile but don't abort the whole sweep.
    return [];
  }

  const data = (await response.json()) as AirplanesLivePointResponse;
  return Array.isArray(data.ac) ? data.ac : [];
};

/**
 * Sweep all US tiles sequentially, de-duplicating aircraft by hex.
 * Stops early if the time budget is exceeded and flags the result as partial.
 */
export const sweepUSAircraft = async (): Promise<SweepResult> => {
  const tiles = generateUSTiles();
  const byHex = new Map<string, AirplanesLiveAircraft>();
  const start = Date.now();
  let tilesFetched = 0;
  let partial = false;

  for (let i = 0; i < tiles.length; i++) {
    if (Date.now() - start > TIME_BUDGET_MS) {
      partial = true;
      break;
    }

    try {
      const result = await fetchTile(tiles[i]);
      if (result === 'rate-limited') {
        await sleep(RATE_LIMIT_BACKOFF_MS);
        // Retry this tile once after backing off.
        const retry = await fetchTile(tiles[i]);
        if (retry !== 'rate-limited') {
          for (const ac of retry) if (ac.hex) byHex.set(ac.hex.toLowerCase(), ac);
        }
      } else {
        for (const ac of result) if (ac.hex) byHex.set(ac.hex.toLowerCase(), ac);
      }
      tilesFetched++;
    } catch {
      // Network hiccup on a single tile: skip and keep going.
    }

    if (i < tiles.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  const ac = Array.from(byHex.values());
  return {
    ac,
    total: ac.length,
    now: Math.floor(Date.now() / 1000),
    tiles: tiles.length,
    tilesFetched,
    partial,
  };
};
