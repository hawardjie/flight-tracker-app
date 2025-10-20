import { Aircraft } from '../types/aircraft';

/**
 * Airplanes.live API Service
 * 100% FREE - No API key required!
 * Documentation: https://airplanes.live/api-guide/
 * Rate limit: 1 request per second
 * For non-commercial use
 */

const AIRPLANES_LIVE_API_BASE = 'https://api.airplanes.live/v2';

interface AirplanesLiveAircraft {
  hex: string;               // ICAO 24-bit address (6 hex digits)
  type?: string;             // Aircraft type
  flight?: string;           // Callsign/flight number
  r?: string;                // Registration
  t?: string;                // Aircraft type code
  alt_baro?: number;         // Barometric altitude in feet
  alt_geom?: number;         // Geometric altitude in feet
  gs?: number;               // Ground speed in knots
  ias?: number;              // Indicated airspeed in knots
  tas?: number;              // True airspeed in knots
  mach?: number;             // Mach number
  track?: number;            // Track angle in degrees (0-359)
  track_rate?: number;       // Rate of change of track in degrees/second
  roll?: number;             // Roll angle in degrees
  mag_heading?: number;      // Magnetic heading in degrees
  true_heading?: number;     // True heading in degrees
  baro_rate?: number;        // Barometric vertical rate in feet/min
  geom_rate?: number;        // Geometric vertical rate in feet/min
  squawk?: string;           // Squawk code
  emergency?: string;        // Emergency status
  category?: string;         // Emitter category
  nav_qnh?: number;          // QNH setting
  nav_altitude_mcp?: number; // MCP selected altitude
  lat?: number;              // Latitude in decimal degrees
  lon?: number;              // Longitude in decimal degrees
  nic?: number;              // Navigation integrity category
  rc?: number;               // Radius of containment
  seen_pos?: number;         // Seconds since position last seen
  version?: number;          // ADS-B version
  nic_baro?: number;         // NIC for barometric altitude
  nac_p?: number;            // Navigation accuracy category for position
  nac_v?: number;            // Navigation accuracy category for velocity
  sil?: number;              // Source integrity level
  sil_type?: string;         // SIL type
  gva?: number;              // Geometric vertical accuracy
  sda?: number;              // System design assurance
  alert?: number;            // Alert flag
  spi?: number;              // Special position identification
  mlat?: string[];           // MLAT fields
  tisb?: string[];           // TIS-B fields
  messages?: number;         // Number of messages received
  seen?: number;             // Seconds since last message
  rssi?: number;             // Signal strength
  dst?: number;              // Distance from receiver in km
  dir?: number;              // Direction from receiver in degrees
}

interface AirplanesLiveResponse {
  ac: AirplanesLiveAircraft[];  // Array of aircraft
  total: number;                 // Total aircraft count
  now: number;                   // Current Unix timestamp
  ctime: number;                 // Cache time
  ptime: number;                 // Processing time
}

/**
 * Fetch with timeout to prevent hanging requests
 */
const fetchWithTimeout = async (url: string, timeout = 30000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log('[Airplanes.live API] Fetching:', url);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - Airplanes.live API is not responding');
    }
    throw error;
  }
};

/**
 * Transform Airplanes.live data to our Aircraft interface
 */
const transformToAircraft = (ac: AirplanesLiveAircraft): Aircraft | null => {
  // Filter out aircraft without valid position data
  if (ac.lat === undefined || ac.lon === undefined) {
    return null;
  }

  // Use barometric altitude if available, otherwise geometric altitude
  const altitude = ac.alt_baro ?? ac.alt_geom ?? 0;

  // Use ground speed if available
  const velocity = ac.gs ?? 0;

  // Use track angle as heading
  const heading = ac.track ?? ac.true_heading ?? ac.mag_heading ?? 0;

  // Use barometric rate if available, otherwise geometric rate
  const verticalRate = ac.baro_rate ?? ac.geom_rate ?? 0;

  // Determine if on ground (altitude less than 100 feet and low speed)
  const onGround = altitude < 100 && velocity < 50;

  return {
    icao24: ac.hex.toLowerCase(),
    callsign: ac.flight?.trim() || ac.hex.toUpperCase(),
    country: 'Unknown', // Airplanes.live doesn't provide country info directly
    position: {
      lat: ac.lat,
      lng: ac.lon,
    },
    altitude: altitude,
    velocity: velocity,
    heading: heading,
    verticalRate: verticalRate,
    onGround: onGround,
    lastUpdate: new Date(), // Use current time as we don't have exact update time
    squawk: ac.squawk,
  };
};

/**
 * Calculate the center point and radius to cover US airspace
 * US bounds: lat 24.5-49.0, lon -125.0 to -66.0
 */
const US_CENTER_LAT = 39.8;  // Center of continental USA
const US_CENTER_LON = -98.5; // Center of continental USA
const US_RADIUS_NM = 1500;   // ~1500 nautical miles to cover all of US

/**
 * Fetch aircraft within US airspace using point/radius endpoint
 * This uses a single point in the center of the US with a large radius
 */
export const getUSAircraftFromAirplanesLive = async (): Promise<Aircraft[]> => {
  console.log('[Airplanes.live API] 🇺🇸 Fetching US aircraft...');
  console.log(`[Airplanes.live API] Using center point: ${US_CENTER_LAT}, ${US_CENTER_LON}, radius: ${US_RADIUS_NM} nm`);

  const url = `${AIRPLANES_LIVE_API_BASE}/point/${US_CENTER_LAT}/${US_CENTER_LON}/${US_RADIUS_NM}`;

  try {
    const response = await fetchWithTimeout(url);
    console.log('[Airplanes.live API] Response status:', response.status);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded for Airplanes.live API (1 req/sec). Please wait a moment.');
      } else if (response.status === 503) {
        throw new Error('Airplanes.live API is temporarily unavailable. Please try again later.');
      }
      throw new Error(`Airplanes.live API error: HTTP ${response.status}`);
    }

    const data: AirplanesLiveResponse = await response.json();
    console.log('[Airplanes.live API] Raw response:', {
      totalAircraft: data.total,
      aircraftArrayLength: data.ac?.length || 0,
      timestamp: data.now
    });

    if (!data.ac || !Array.isArray(data.ac)) {
      console.warn('[Airplanes.live API] Invalid response format - no aircraft array');
      return [];
    }

    console.log('[Airplanes.live API] 🔄 Transforming aircraft...');
    const aircraft = data.ac
      .map(transformToAircraft)
      .filter((ac): ac is Aircraft => ac !== null);

    console.log(`[Airplanes.live API] ✅ Successfully transformed ${aircraft.length} aircraft from ${data.total} total`);
    return aircraft;

  } catch (error) {
    console.error('[Airplanes.live API] ❌ Fetch error:', error);
    throw error;
  }
};

/**
 * Fetch aircraft within a custom point and radius
 * @param lat Latitude of center point
 * @param lon Longitude of center point
 * @param radiusNm Radius in nautical miles (max 250)
 */
export const getAircraftByPointFromAirplanesLive = async (
  lat: number,
  lon: number,
  radiusNm: number = 250
): Promise<Aircraft[]> => {
  console.log('[Airplanes.live API] 📍 Fetching aircraft by point...');
  console.log(`[Airplanes.live API] Center: ${lat}, ${lon}, Radius: ${radiusNm} nm`);

  // Limit radius to 250 nm as per API docs
  const clampedRadius = Math.min(radiusNm, 250);
  if (radiusNm > 250) {
    console.warn('[Airplanes.live API] Radius clamped to 250 nm (API maximum)');
  }

  const url = `${AIRPLANES_LIVE_API_BASE}/point/${lat}/${lon}/${clampedRadius}`;

  try {
    const response = await fetchWithTimeout(url);
    console.log('[Airplanes.live API] Response status:', response.status);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded for Airplanes.live API (1 req/sec). Please wait a moment.');
      } else if (response.status === 503) {
        throw new Error('Airplanes.live API is temporarily unavailable. Please try again later.');
      }
      throw new Error(`Airplanes.live API error: HTTP ${response.status}`);
    }

    const data: AirplanesLiveResponse = await response.json();
    console.log('[Airplanes.live API] Raw response:', {
      totalAircraft: data.total,
      aircraftArrayLength: data.ac?.length || 0
    });

    if (!data.ac || !Array.isArray(data.ac)) {
      console.warn('[Airplanes.live API] Invalid response format - no aircraft array');
      return [];
    }

    console.log('[Airplanes.live API] 🔄 Transforming aircraft...');
    const aircraft = data.ac
      .map(transformToAircraft)
      .filter((ac): ac is Aircraft => ac !== null);

    console.log(`[Airplanes.live API] ✅ Successfully transformed ${aircraft.length} aircraft`);
    return aircraft;

  } catch (error) {
    console.error('[Airplanes.live API] ❌ Fetch error:', error);
    throw error;
  }
};
