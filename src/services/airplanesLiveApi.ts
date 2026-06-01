import { Aircraft } from '../types/aircraft';
import type { AirplanesLiveAircraft, SweepResult } from '../../lib/airplanesSweep';

/**
 * Airplanes.live API Service (client side)
 *
 * Airplanes.live's /point endpoint caps the radius at 250 nm, so the whole US
 * can't be fetched in one upstream call. The tiling sweep runs server-side (see
 * api/aircraft.ts + lib/airplanesSweep.ts); the browser makes a SINGLE request
 * to our same-origin /api/aircraft endpoint and receives the deduped result.
 *
 * In production /api/aircraft is a Vercel serverless function; in dev it's the
 * Vite plugin (see vite.config.ts). Both run the identical sweep.
 */

// Same-origin proxy endpoint backed by the server-side sweep.
const AIRCRAFT_ENDPOINT = '/api/aircraft';

// The server sweep takes ~45s on a cold call, so allow generous headroom before
// the client gives up.
const FETCH_TIMEOUT_MS = 75000;

const fetchWithTimeout = async (url: string, timeout = FETCH_TIMEOUT_MS): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log('[Airplanes.live API] Fetching:', url);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - aircraft feed is not responding');
    }
    throw error;
  }
};

/**
 * Transform a raw Airplanes.live aircraft record into our internal shape.
 * Returns null for aircraft without a valid position.
 */
const transformToAircraft = (ac: AirplanesLiveAircraft): Aircraft | null => {
  if (ac.lat === undefined || ac.lon === undefined) {
    return null;
  }

  const altitude = typeof ac.alt_baro === 'number' ? ac.alt_baro : ac.alt_geom ?? 0;
  const velocity = ac.gs ?? 0;
  const heading = ac.track ?? ac.true_heading ?? ac.mag_heading ?? 0;
  const verticalRate = ac.baro_rate ?? ac.geom_rate ?? 0;
  const onGround = altitude < 100 && velocity < 50;

  return {
    icao24: ac.hex.toLowerCase(),
    callsign: ac.flight?.trim() || ac.hex.toUpperCase(),
    country: 'Unknown',
    position: { lat: ac.lat, lng: ac.lon },
    altitude: Math.round(altitude),
    velocity: Math.round(velocity),
    heading,
    verticalRate: Math.round(verticalRate),
    onGround,
    lastUpdate: new Date(),
    squawk: ac.squawk,
  };
};

/**
 * Fetch all aircraft over the continental US via the server-side sweep.
 */
export const getUSAircraft = async (): Promise<Aircraft[]> => {
  console.log('[Airplanes.live API] 🇺🇸 Fetching all US aircraft via server sweep...');

  try {
    const response = await fetchWithTimeout(AIRCRAFT_ENDPOINT);
    console.log('[Airplanes.live API] Response status:', response.status);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment.');
      }
      if (response.status === 502 || response.status === 503) {
        throw new Error('Aircraft feed is temporarily unavailable. Please try again later.');
      }
      throw new Error(`Aircraft feed error: HTTP ${response.status}`);
    }

    const data: SweepResult = await response.json();

    if (!data.ac || !Array.isArray(data.ac)) {
      console.warn('[Airplanes.live API] No aircraft in response');
      return [];
    }

    const aircraft = data.ac
      .map(transformToAircraft)
      .filter((ac): ac is Aircraft => ac !== null);

    console.log(
      `[Airplanes.live API] ✅ ${aircraft.length} aircraft ` +
        `(${data.tilesFetched}/${data.tiles} tiles${data.partial ? ', partial' : ''})`
    );
    return aircraft;
  } catch (error) {
    console.error('[Airplanes.live API] ❌ Fetch error:', error);
    throw error;
  }
};
