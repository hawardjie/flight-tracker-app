/**
 * Format altitude in feet with thousands separator
 */
export const formatAltitude = (altitude: number): string => {
  if (altitude === 0) return 'Ground';
  return `${altitude.toLocaleString()} ft`;
};

/**
 * Format speed in knots
 */
export const formatSpeed = (speed: number): string => {
  return `${Math.round(speed)} kts`;
};

/**
 * Format heading in degrees
 */
export const formatHeading = (heading: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(heading / 45) % 8;
  return `${Math.round(heading)}° ${directions[index]}`;
};

/**
 * Format vertical rate
 */
export const formatVerticalRate = (rate: number): string => {
  const absRate = Math.abs(rate);
  const direction = rate > 0 ? '↑' : rate < 0 ? '↓' : '→';
  return `${direction} ${absRate.toLocaleString()} ft/min`;
};

/**
 * Format time ago
 */
export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

/**
 * Get color based on altitude
 */
export const getAltitudeColor = (altitude: number): string => {
  if (altitude === 0) return '#94a3b8'; // gray for ground
  if (altitude < 10000) return '#60a5fa'; // blue for low
  if (altitude < 25000) return '#34d399'; // green for medium
  if (altitude < 40000) return '#fbbf24'; // yellow for high
  return '#f87171'; // red for very high
};

/**
 * Get color based on speed
 */
export const getSpeedColor = (speed: number): string => {
  if (speed < 100) return '#94a3b8'; // gray for slow
  if (speed < 250) return '#60a5fa'; // blue for low
  if (speed < 400) return '#34d399'; // green for medium
  if (speed < 500) return '#fbbf24'; // yellow for fast
  return '#f87171'; // red for very fast
};

/**
 * Utility to combine class names
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Calculate statistics from aircraft array
 */
import { Aircraft } from '../types/aircraft';

export interface AircraftStats {
  total: number;
  inAir: number;
  onGround: number;
  avgAltitude: number;
  avgSpeed: number;
  maxAltitude: number;
  countries: number;
}

export const getAircraftStats = (aircraft: Aircraft[]): AircraftStats => {
  if (aircraft.length === 0) {
    return {
      total: 0,
      inAir: 0,
      onGround: 0,
      avgAltitude: 0,
      avgSpeed: 0,
      maxAltitude: 0,
      countries: 0,
    };
  }

  const inAir = aircraft.filter(ac => !ac.onGround);
  const onGround = aircraft.filter(ac => ac.onGround);

  const totalAltitude = inAir.reduce((sum, ac) => sum + ac.altitude, 0);
  const totalSpeed = inAir.reduce((sum, ac) => sum + ac.velocity, 0);
  const maxAltitude = Math.max(...aircraft.map(ac => ac.altitude), 0);

  const uniqueCountries = new Set(aircraft.map(ac => ac.country));

  return {
    total: aircraft.length,
    inAir: inAir.length,
    onGround: onGround.length,
    avgAltitude: inAir.length > 0 ? Math.round(totalAltitude / inAir.length) : 0,
    avgSpeed: inAir.length > 0 ? Math.round(totalSpeed / inAir.length) : 0,
    maxAltitude: maxAltitude,
    countries: uniqueCountries.size,
  };
};
