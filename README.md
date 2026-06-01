# Flight Tracker - Real-time Aircraft Monitoring (US Airspace)

A modern, real-time flight tracking dashboard built with React, TypeScript, and Leaflet. Track aircraft over United States airspace with live position updates, detailed flight information, and customizable filters using a FREE data source.

![Flight Tracker Dashboard](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Vite](https://img.shields.io/badge/Vite-6.0-purple) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)

## Features

### Real-time Flight Tracking
- **Live Updates**: Automatic refresh of aircraft positions every 30 seconds (configurable)
- **100% FREE Data Source**: Powered by the OpenSky Network - No API key required!
- **Single-Request Coverage**: The entire continental US is fetched in one request
- **Interactive Map**: Dark-themed map centered on continental USA with smooth navigation and zoom controls
- **Aircraft Markers**: Custom markers showing aircraft heading and status with altitude-based color coding
- **US Focused**: Optimized to track flights over United States (24.5°N to 49°N, 125°W to 66°W)

### Advanced Controls
- **Smart Search**: Search aircraft by callsign or ICAO24 identifier
- **Altitude Filters**: Filter aircraft by altitude range (0-50,000 ft)
- **Speed Filters**: Filter by ground speed (0-1,000 knots)
- **Status Filters**: Show only airborne or grounded aircraft
- **Auto-refresh Toggle**: Enable/disable automatic updates
- **Refresh Interval Control**: Customize update frequency

### Rich Data Display
- **Live Statistics Panel**:
  - Total aircraft count
  - Airborne vs grounded aircraft
  - Average altitude and speed
  - Number of countries represented
  - Maximum altitude tracking

- **Detailed Aircraft Information**:
  - Callsign and ICAO24 identifier
  - Real-time position (latitude/longitude)
  - Altitude (barometric)
  - Ground speed
  - Heading with cardinal direction
  - Vertical rate (climb/descent)
  - Country of origin
  - Squawk code
  - Last update timestamp

### Modern UI/UX
- **Dark Theme**: Eye-friendly dark color scheme
- **Glass Morphism**: Beautiful glassmorphic panels with backdrop blur
- **Responsive Design**: Works on desktop and tablet devices
- **Smooth Animations**: Polished transitions and hover effects
- **Color-coded Markers**: Aircraft colored by altitude for quick visual reference

## Technology Stack

- **Frontend Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 6.0 for lightning-fast development
- **Styling**: Tailwind CSS 3.4 for utility-first styling
- **Mapping**: Leaflet 1.9 with React-Leaflet 4.2
- **Icons**: Lucide React for modern iconography
- **Data Source**: OpenSky Network REST API (100% FREE, no API key required)

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed on your machine
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/flight-tracker-app.git
cd flight-tracker-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

The app will automatically open in your default browser!

### Building for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### Navigating the Map
- **Zoom**: Use mouse wheel or map zoom controls
- **Pan**: Click and drag to move around the map
- **Select Aircraft**: Click any aircraft marker to view details

### Using Filters
1. Click the **Filter** button in the control panel
2. Set altitude range (in feet)
3. Set speed range (in knots)
4. Toggle "On Ground" or "Airborne" filters
5. Click "Reset Filters" to clear all filters

### Searching for Aircraft
1. Use the search bar in the control panel
2. Type callsign (e.g., "UAL123") or ICAO24 (e.g., "a12345")
3. Results update in real-time as you type

### Adjusting Refresh Settings
1. Click the **Settings** button (gear icon)
2. Toggle "Auto Refresh" on/off
3. Adjust refresh interval slider
4. Manual refresh available via refresh button

## API Information

This application uses the **OpenSky Network** - a 100% FREE crowd-sourced ADS-B data source!

### OpenSky Network API

- **Cost**: FREE - No API key required for anonymous access
- **Authentication**: None required for anonymous access (authenticated accounts get higher limits)
- **Single Request**: The `/states/all` endpoint returns every aircraft within a bounding box in one request, so the whole US is fetched at once
- **Rate Limiting**: Anonymous access is credit-limited and serves data at ~10 second resolution
- **Data Coverage**: Global real-time ADS-B data from community receivers
- **Documentation**: [openskynetwork.github.io/opensky-api](https://openskynetwork.github.io/opensky-api/rest.html)

### Data Fields Provided

The API provides comprehensive flight information (converted to imperial units in-app):
- **Position**: Latitude/longitude coordinates
- **Altitude**: Barometric/geometric altitude (meters, converted to feet)
- **Speed**: Velocity (m/s, converted to knots)
- **Heading**: True track angle in degrees
- **Vertical Rate**: Climb/descent rate (m/s, converted to feet per minute)
- **Identification**: Callsign and ICAO24 address
- **Status**: On-ground status
- **Squawk Code**: Transponder code
- **Country**: Origin country

## Project Structure

```
flight-tracker-app/
├── src/
│   ├── components/
│   │   ├── AircraftDetails.tsx    # Selected aircraft details panel
│   │   ├── AircraftMarker.tsx     # Individual aircraft map marker
│   │   ├── ControlPanel.tsx       # Filters and settings controls
│   │   ├── FlightMap.tsx          # Main Leaflet map component
│   │   └── StatsPanel.tsx         # Live statistics display
│   ├── hooks/
│   │   └── useAircraftData.ts     # Custom hook for API data fetching
│   ├── services/
│   │   └── openSkyApi.ts          # OpenSky Network API integration
│   ├── types/
│   │   └── aircraft.ts            # TypeScript interfaces
│   ├── utils/
│   │   └── formatting.ts          # Helper functions for formatting
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles and Tailwind imports
├── public/                        # Static assets
├── index.html                     # HTML template
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── vercel.json                    # Vercel deployment configuration
└── README.md                      # This file
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

This project uses:
- ESLint for code quality
- TypeScript strict mode for type safety
- Tailwind CSS for consistent styling

## Performance Optimization

- **Efficient Filtering**: Uses React.useMemo for optimized aircraft filtering
- **Controlled Updates**: Configurable refresh intervals to manage API usage
- **Lazy Rendering**: Only renders visible aircraft markers
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Troubleshooting

### Rate Limit Errors
If you encounter "Rate limit exceeded" errors:
- **Default Protection**: The app defaults to 30-second intervals
- **Adjust Settings**: Increase the refresh interval in settings
- **Wait it Out**: Wait a few minutes, then try again
- **Avoid Manual Refresh**: Don't click the manual refresh button repeatedly

**Why Rate Limits Happen:**
OpenSky throttles anonymous access by API credits (a large bounding-box request costs more credits). You may hit this limit if:
- You click manual refresh multiple times quickly
- Your refresh interval is too low
- Multiple browser tabs are open with the app

### No Aircraft Displayed
- Check your internet connection
- Verify the OpenSky Network API is operational at [opensky-network.org](https://opensky-network.org)
- Try refreshing the page
- Check browser console (F12) for errors
- Wait a few minutes if rate-limited

### Map Not Loading
- Ensure you have an internet connection
- Check that Leaflet CSS is loading properly
- Clear browser cache and reload

## Future Enhancements

Potential features for future development:
- Flight path tracking and history
- Airport information and markers
- Weather overlay layers
- Flight notifications and alerts
- Save favorite aircraft
- Export data to CSV/JSON
- Mobile app version
- 3D visualization mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **[OpenSky Network](https://opensky-network.org)** - For providing 100% FREE crowd-sourced ADS-B data
- **[Leaflet](https://leafletjs.com)** - For the excellent mapping library
- **[React Leaflet](https://react-leaflet.js.org)** - For React integration with Leaflet
- **[Tailwind CSS](https://tailwindcss.com)** - For the utility-first styling framework
- **[Vite](https://vitejs.dev)** - For the blazing fast build tool
- **All ADS-B enthusiasts** who contribute to the OpenSky Network

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with passion for aviation and open-source technology**
