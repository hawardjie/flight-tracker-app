import { Aircraft } from '../types/aircraft';

/**
 * OpenSky Network API Service
 * FREE - No API key required for anonymous access.
 * Documentation: https://openskynetwork.github.io/opensky-api/rest.html
 *
 * Unlike Airplanes.live (250 nm radius cap), OpenSky's /states/all endpoint
 * returns every aircraft within a bounding box in a SINGLE request, so the
 * whole US can be fetched at once without a rate-limited tile sweep.
 *
 * Note: anonymous access is rate/credit limited and serves data at ~10s
 * resolution. Authenticated accounts get higher limits.
 */

// Same-origin proxy endpoint. In production this is a Vercel Node serverless
// function (api/opensky.ts); in dev it's the Vite proxy (see vite.config.ts).
// Both forward to https://opensky-network.org/api/states/all server-side,
// avoiding browser CORS issues and OpenSky's edge-IP connection blocking.
const OPENSKY_PROXY_ENDPOINT = '/api/opensky';

// Continental US bounding box.
const US_BBOX = {
  lamin: 24.0,   // south
  lomin: -125.0, // west
  lamax: 49.5,   // north
  lomax: -66.0,  // east
};

// Unit conversions: OpenSky reports metric units.
const METERS_TO_FEET = 3.28084;
const MS_TO_KNOTS = 1.94384;
const MS_TO_FEET_PER_MIN = 196.850394;

/**
 * A single OpenSky "state vector" is returned as a positional array, not an
 * object. These indices map to the documented fields.
 */
type OpenSkyStateVector = [
  string,            // 0  icao24
  string | null,     // 1  callsign
  string,            // 2  origin_country
  number | null,     // 3  time_position
  number,            // 4  last_contact
  number | null,     // 5  longitude
  number | null,     // 6  latitude
  number | null,     // 7  baro_altitude (m)
  boolean,           // 8  on_ground
  number | null,     // 9  velocity (m/s)
  number | null,     // 10 true_track (deg)
  number | null,     // 11 vertical_rate (m/s)
  number[] | null,   // 12 sensors
  number | null,     // 13 geo_altitude (m)
  string | null,     // 14 squawk
  boolean,           // 15 spi
  number,            // 16 position_source
  ...unknown[]       // newer API versions append extra fields
];

interface OpenSkyAllResponse {
  time: number;
  states: OpenSkyStateVector[] | null;
}

const fetchWithTimeout = async (url: string, timeout = 30000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log('[OpenSky API] Fetching:', url);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - OpenSky API is not responding');
    }
    throw error;
  }
};

/**
 * Transform an OpenSky state vector into our internal Aircraft shape.
 * Returns null for aircraft without a valid position.
 */
const transformToAircraft = (s: OpenSkyStateVector): Aircraft | null => {
  const icao24 = s[0];
  const callsign = s[1];
  const country = s[2];
  const lastContact = s[4];
  const lon = s[5];
  const lat = s[6];
  const baroAltitude = s[7];
  const onGround = s[8];
  const velocityMs = s[9];
  const trueTrack = s[10];
  const verticalRateMs = s[11];
  const geoAltitude = s[13];
  const squawk = s[14];

  if (lat === null || lon === null) {
    return null;
  }

  const altitudeMeters = baroAltitude ?? geoAltitude ?? 0;

  return {
    icao24: icao24.toLowerCase(),
    callsign: callsign?.trim() || icao24.toUpperCase(),
    country: country || 'Unknown',
    position: { lat, lng: lon },
    altitude: Math.round(altitudeMeters * METERS_TO_FEET),
    velocity: Math.round((velocityMs ?? 0) * MS_TO_KNOTS),
    heading: trueTrack ?? 0,
    verticalRate: Math.round((verticalRateMs ?? 0) * MS_TO_FEET_PER_MIN),
    onGround,
    lastUpdate: new Date(lastContact * 1000),
    squawk: squawk ?? undefined,
  };
};

/**
 * Fetch all aircraft over the continental US in a single request.
 */
export const getUSAircraftFromOpenSky = async (): Promise<Aircraft[]> => {
  const { lamin, lomin, lamax, lomax } = US_BBOX;
  const url = `${OPENSKY_PROXY_ENDPOINT}?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

  console.log('[OpenSky API] 🇺🇸 Fetching all US aircraft in one request...');

  try {
    const response = await fetchWithTimeout(url);
    console.log('[OpenSky API] Response status:', response.status);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded for OpenSky API. Please wait a moment.');
      }
      if (response.status === 503) {
        throw new Error('OpenSky API is temporarily unavailable. Please try again later.');
      }
      throw new Error(`OpenSky API error: HTTP ${response.status}`);
    }

    const data: OpenSkyAllResponse = await response.json();

    if (!data.states || !Array.isArray(data.states)) {
      console.warn('[OpenSky API] No state vectors in response');
      return [];
    }

    const aircraft = data.states
      .map(transformToAircraft)
      .filter((ac): ac is Aircraft => ac !== null);

    console.log(`[OpenSky API] ✅ ${aircraft.length} aircraft (from ${data.states.length} state vectors)`);
    return aircraft;
  } catch (error) {
    console.error('[OpenSky API] ❌ Fetch error:', error);
    throw error;
  }
};
