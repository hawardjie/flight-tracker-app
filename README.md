# Flight Tracker - Real-time Aircraft Monitoring (US Airspace)

A modern, real-time flight tracking dashboard built with React, TypeScript, and Leaflet. Track aircraft over United States airspace with live position updates, detailed flight information, and customizable filters using multiple FREE data sources.

![Flight Tracker Dashboard](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Vite](https://img.shields.io/badge/Vite-6.0-purple) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)

## Features

### Real-time Flight Tracking
- **Live Updates**: Automatic refresh of aircraft positions every 15 seconds (configurable from 15-60s)
- **100% FREE Data Source**: Powered by Airplanes.live - No API key required!
- **Interactive Map**: Dark-themed map centered on continental USA with smooth navigation and zoom controls
- **Aircraft Markers**: Custom markers showing aircraft heading and status with altitude-based color coding
- **US Focused**: Optimized to track flights over United States (24.5°N to 49°N, 125°W to 66°W)
- **Smart Rate Limiting**: Respects Airplanes.live's 1 request per second limit

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
- **Data Source**: Airplanes.live REST API (100% FREE, no API key required)

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
3. Adjust refresh interval slider (5-30 seconds)
4. Manual refresh available via refresh button

## API Information

This application uses **Airplanes.live** - a 100% FREE community-driven ADS-B data source!

### ✈️ Airplanes.live API

- **Cost**: FREE forever - No paid tiers
- **Authentication**: None required - No API key needed
- **Rate Limit**: 1 request per second
- **Data Coverage**: Global real-time ADS-B data from community receivers
- **Setup**: Zero configuration - Works out of the box
- **Documentation**: [airplanes.live/api-guide](https://airplanes.live/api-guide/)

### Why Airplanes.live?

✅ **No API Key** - Start using immediately
✅ **100% FREE** - No paid plans or usage limits
✅ **Community-Driven** - Real data from enthusiast receivers worldwide
✅ **Simple Rate Limits** - 1 request per second (15s default refresh)
✅ **No Registration** - Anonymous access included
✅ **High Quality Data** - ADS-B and MLAT from global network

### Data Fields Provided

The API provides comprehensive flight information:
- **Position**: Latitude/longitude coordinates
- **Altitude**: Barometric and geometric altitude in feet
- **Speed**: Ground speed in knots
- **Heading**: Track angle in degrees
- **Vertical Rate**: Climb/descent rate in feet per minute
- **Identification**: Callsign and ICAO24 address
- **Status**: On-ground status
- **Squawk Code**: Transponder code
- **Aircraft Type**: When available
- **Registration**: Aircraft registration number

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
│   │   └── airplanesLiveApi.ts    # Airplanes.live API integration
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
- **Default Protection**: The app defaults to 15-second intervals (respects 1 req/sec limit)
- **Adjust Settings**: Increase refresh interval to 20-30 seconds in settings
- **Wait it Out**: Wait 60 seconds, then try again
- **Avoid Manual Refresh**: Don't click the manual refresh button repeatedly
- **API Limits**: Airplanes.live limits: 1 request per second

**Why Rate Limits Happen:**
Airplanes.live has a 1 request per second limit. You may hit this limit if:
- You click manual refresh multiple times quickly
- Your refresh interval is too low
- Multiple browser tabs are open with the app

### No Aircraft Displayed
- Check your internet connection
- Verify Airplanes.live API is operational at [airplanes.live](https://airplanes.live)
- Try refreshing the page
- Check browser console (F12) for errors
- Wait 60 seconds if rate-limited

### Map Not Loading
- Ensure you have an internet connection
- Check that Leaflet CSS is loading properly
- Clear browser cache and reload

## Deployment to Vercel

### Quick Deploy with One Click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/flight-tracker-app)

### Manual Deployment (Step-by-Step)

#### Prerequisites
- GitHub account
- Vercel account (free - sign up at [vercel.com](https://vercel.com))

#### Step 1: Push to GitHub

If you haven't already pushed your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Flight tracker app"

# Create a new repository on GitHub, then add it as remote
git remote add origin https://github.com/YOUR_USERNAME/flight-tracker-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `flight-tracker-app` repository
5. Vercel will auto-detect Vite settings

#### Step 3: Configure Project (Auto-detected)

Vercel automatically configures:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

No changes needed! ✅

#### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for the build to complete
3. Your app is now live! 🎉

#### Step 5: Access Your App

Your flight tracker will be available at:
```
https://flight-tracker-app.vercel.app
```
Or your custom domain if configured.

### Alternative: Deploy with Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

**No environment variables needed!** 🎉

This app uses Airplanes.live which requires:
- ✅ No API key
- ✅ No registration
- ✅ No authentication
- ✅ Zero configuration

Just deploy and it works!

### Custom Domain (Optional)

1. In your Vercel project dashboard
2. Go to **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

### Automatic Deployments

Once connected, Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request

### Build Logs

If deployment fails:
1. Check build logs in Vercel dashboard
2. Common issues:
   - Missing dependencies: Run `npm install` locally
   - TypeScript errors: Run `npm run build` locally to test
   - Linting errors: Run `npm run lint` locally

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

- **[Airplanes.live](https://airplanes.live)** - For providing 100% FREE community-driven ADS-B data
- **[Leaflet](https://leafletjs.com)** - For the excellent mapping library
- **[React Leaflet](https://react-leaflet.js.org)** - For React integration with Leaflet
- **[Tailwind CSS](https://tailwindcss.com)** - For the utility-first styling framework
- **[Vite](https://vitejs.dev)** - For the blazing fast build tool
- **All ADS-B enthusiasts** who contribute to the Airplanes.live network

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with passion for aviation and open-source technology**
