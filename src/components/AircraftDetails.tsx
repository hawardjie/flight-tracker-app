import { X, Plane } from 'lucide-react';
import { Aircraft } from '../types/aircraft';
import { formatAltitude, formatSpeed, formatHeading, formatVerticalRate, formatTimeAgo, getAltitudeColor, getSpeedColor } from '../utils/formatting';

interface AircraftDetailsProps {
  aircraft: Aircraft | null;
  onClose: () => void;
}

export const AircraftDetails: React.FC<AircraftDetailsProps> = ({ aircraft, onClose }) => {
  if (!aircraft) return null;

  const altitudeColor = getAltitudeColor(aircraft.altitude);
  const speedColor = getSpeedColor(aircraft.velocity);

  return (
    <div className="glass-panel p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Aircraft Details</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-secondary rounded transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Callsign and ICAO */}
        <div>
          <div className="text-2xl font-bold text-primary mb-1">{aircraft.callsign}</div>
          <div className="text-sm text-muted-foreground">
            ICAO24: <span className="font-mono">{aircraft.icao24?.toUpperCase() || 'N/A'}</span>
          </div>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <div className="text-xs text-muted-foreground mb-1">Altitude</div>
            <div className="text-lg font-bold" style={{ color: altitudeColor }}>
              {formatAltitude(aircraft.altitude)}
            </div>
          </div>

          <div className="stat-card">
            <div className="text-xs text-muted-foreground mb-1">Speed</div>
            <div className="text-lg font-bold" style={{ color: speedColor }}>
              {formatSpeed(aircraft.velocity)}
            </div>
          </div>

          <div className="stat-card">
            <div className="text-xs text-muted-foreground mb-1">Heading</div>
            <div className="text-lg font-bold">{formatHeading(aircraft.heading)}</div>
          </div>

          <div className="stat-card">
            <div className="text-xs text-muted-foreground mb-1">Vertical Rate</div>
            <div className="text-lg font-bold">{formatVerticalRate(aircraft.verticalRate)}</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Country</span>
            <span className="font-semibold">{aircraft.country}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-semibold ${aircraft.onGround ? 'text-yellow-400' : 'text-green-400'}`}>
              {aircraft.onGround ? 'On Ground' : 'Airborne'}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Position</span>
            <span className="font-mono text-xs">
              {aircraft.position.lat.toFixed(4)}°, {aircraft.position.lng.toFixed(4)}°
            </span>
          </div>

          {aircraft.squawk && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Squawk</span>
              <span className="font-mono font-semibold">{aircraft.squawk}</span>
            </div>
          )}

          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Last Update</span>
            <span>{formatTimeAgo(aircraft.lastUpdate)}</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Live tracking active</span>
        </div>
      </div>
    </div>
  );
};
