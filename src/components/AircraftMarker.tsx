import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Aircraft } from '../types/aircraft';
import { formatAltitude, formatSpeed, formatHeading, formatVerticalRate, formatTimeAgo, getAltitudeColor } from '../utils/formatting';

interface AircraftMarkerProps {
  aircraft: Aircraft;
  onClick?: (aircraft: Aircraft) => void;
}

const createAircraftIcon = (heading: number, color: string, onGround: boolean) => {
  const svgIcon = onGround
    ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="6" fill="${color}" opacity="0.8"/>
        <circle cx="12" cy="12" r="3" fill="#fff"/>
      </svg>`
    : `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${heading}deg)">
        <path d="M12 2L13 10H11L12 2Z" fill="${color}"/>
        <path d="M12 10L20 14L12 12L4 14L12 10Z" fill="${color}"/>
        <path d="M12 12L14 20H10L12 12Z" fill="${color}"/>
        <circle cx="12" cy="11" r="2" fill="#fff"/>
      </svg>`;

  return L.divIcon({
    html: svgIcon,
    className: 'aircraft-marker',
    iconSize: onGround ? [24, 24] : [32, 32],
    iconAnchor: onGround ? [12, 12] : [16, 16],
    popupAnchor: [0, onGround ? -12 : -16],
  });
};

export const AircraftMarker: React.FC<AircraftMarkerProps> = ({ aircraft, onClick }) => {
  const icon = createAircraftIcon(
    aircraft.heading,
    getAltitudeColor(aircraft.altitude),
    aircraft.onGround
  );

  const handleClick = () => {
    if (onClick) {
      onClick(aircraft);
    }
  };

  return (
    <Marker
      position={[aircraft.position.lat, aircraft.position.lng]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
        <div className="text-xs font-semibold">{aircraft.callsign}</div>
      </Tooltip>
      <Popup>
        <div className="min-w-[200px] p-2">
          <div className="text-lg font-bold mb-2 text-primary">{aircraft.callsign}</div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ICAO24:</span>
              <span className="font-mono">{aircraft.icao24?.toUpperCase() || 'N/A'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Country:</span>
              <span>{aircraft.country}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Altitude:</span>
              <span className="font-semibold">{formatAltitude(aircraft.altitude)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Speed:</span>
              <span className="font-semibold">{formatSpeed(aircraft.velocity)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Heading:</span>
              <span>{formatHeading(aircraft.heading)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">V/S:</span>
              <span>{formatVerticalRate(aircraft.verticalRate)}</span>
            </div>

            {aircraft.squawk && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Squawk:</span>
                <span className="font-mono">{aircraft.squawk}</span>
              </div>
            )}

            <div className="flex justify-between text-xs pt-1 border-t border-border">
              <span className="text-muted-foreground">Last Update:</span>
              <span>{formatTimeAgo(aircraft.lastUpdate)}</span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
