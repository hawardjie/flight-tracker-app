// OpenSky Network API response types
export interface OpenSkyState {
  icao24: string;           // Unique ICAO 24-bit address
  callsign: string | null;  // Callsign
  origin_country: string;   // Country name inferred from ICAO 24-bit address
  time_position: number | null;  // Unix timestamp (seconds) for last position update
  last_contact: number;     // Unix timestamp (seconds) for last update
  longitude: number | null; // WGS-84 longitude in decimal degrees
  latitude: number | null;  // WGS-84 latitude in decimal degrees
  baro_altitude: number | null;  // Barometric altitude in meters
  on_ground: boolean;       // Boolean value indicating if aircraft is on ground
  velocity: number | null;  // Velocity over ground in m/s
  true_track: number | null; // True track in decimal degrees clockwise from north (0-360)
  vertical_rate: number | null; // Vertical rate in m/s
  sensors: number[] | null; // IDs of receivers which contributed to this state vector
  geo_altitude: number | null;  // Geometric altitude in meters
  squawk: string | null;    // Transponder code (Mode A)
  spi: boolean;             // Whether flight status indicates special purpose indicator
  position_source: number;  // Origin of position (0 = ADS-B, 1 = ASTERIX, 2 = MLAT)
}

export interface OpenSkyResponse {
  time: number;  // The time which the state vectors in this response are valid for
  states: OpenSkyState[] | null;  // The state vectors
}

// Our internal aircraft type for easier usage
export interface Aircraft {
  icao24: string;
  callsign: string;
  country: string;
  position: {
    lat: number;
    lng: number;
  };
  altitude: number; // in feet
  velocity: number; // in knots
  heading: number;  // in degrees
  verticalRate: number; // in feet/min
  onGround: boolean;
  lastUpdate: Date;
  squawk?: string;
}

export interface FilterOptions {
  minAltitude: number;
  maxAltitude: number;
  minSpeed: number;
  maxSpeed: number;
  countries: string[];
  onGroundOnly: boolean;
  inAirOnly: boolean;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}
