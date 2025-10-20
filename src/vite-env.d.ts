/// <reference types="vite/client" />

// Declare CSS module types
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Declare Leaflet CSS
declare module 'leaflet/dist/leaflet.css';
