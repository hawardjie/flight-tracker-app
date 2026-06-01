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
