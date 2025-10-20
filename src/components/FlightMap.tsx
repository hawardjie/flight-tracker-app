import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Aircraft } from '../types/aircraft';
import { AircraftMarker } from './AircraftMarker';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

interface FlightMapProps {
  aircraft: Aircraft[];
  center?: [number, number];
  zoom?: number;
  selectedAircraft?: Aircraft | null;
  onAircraftClick?: (aircraft: Aircraft) => void;
}

// Component to handle map view changes
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

export const FlightMap: React.FC<FlightMapProps> = ({
  aircraft,
  center = [40.0, -95.0], // Center of USA as default
  zoom = 5,
  onAircraftClick,
}) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <MapViewController center={center} zoom={zoom} />

      {aircraft.map((ac) => (
        <AircraftMarker
          key={ac.icao24}
          aircraft={ac}
          onClick={onAircraftClick}
        />
      ))}
    </MapContainer>
  );
};
