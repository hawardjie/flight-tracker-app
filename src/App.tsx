import { useState, useMemo } from 'react';
import { FlightMap } from './components/FlightMap';
import { StatsPanel } from './components/StatsPanel';
import { ControlPanel } from './components/ControlPanel';
import { AircraftDetails } from './components/AircraftDetails';
import { useAircraftData } from './hooks/useAircraftData';
import { Aircraft, FilterOptions, BoundingBox } from './types/aircraft';
import { Plane } from 'lucide-react';

// Default bounding box for USA
const US_BOUNDS: BoundingBox = {
  minLat: 24.5,    // Southern tip of Florida
  maxLat: 49.0,    // Northern border with Canada
  minLon: -125.0,  // West Coast
  maxLon: -66.0,   // East Coast
};

// Center of continental USA
const US_CENTER: [number, number] = [39.8, -98.5];

function App() {
  const [autoRefresh, setAutoRefresh] = useState(true); // ON by default - auto-load flights
  const [refreshInterval, setRefreshInterval] = useState(15000); // 15s (Airplanes.live: 1 req/sec limit)
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    minAltitude: 0,
    maxAltitude: 50000,
    minSpeed: 0,
    maxSpeed: 1000,
    countries: [],
    onGroundOnly: false,
    inAirOnly: false,
  });

  const { aircraft, loading, error, lastUpdate, refresh } = useAircraftData({
    autoRefresh,
    refreshInterval,
  });

  // Filter for US airspace and apply user filters
  const filteredAircraft = useMemo(() => {
    const filtered = aircraft.filter((ac) => {
      // Filter for US bounds (client-side)
      if (
        ac.position.lat < US_BOUNDS.minLat ||
        ac.position.lat > US_BOUNDS.maxLat ||
        ac.position.lng < US_BOUNDS.minLon ||
        ac.position.lng > US_BOUNDS.maxLon
      ) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesCallsign = ac.callsign?.toLowerCase().includes(query) || false;
        const matchesIcao = ac.icao24?.toLowerCase().includes(query) || false;
        if (!matchesCallsign && !matchesIcao) return false;
      }

      // Altitude filter
      if (ac.altitude < filters.minAltitude || ac.altitude > filters.maxAltitude) {
        return false;
      }

      // Speed filter
      if (ac.velocity < filters.minSpeed || ac.velocity > filters.maxSpeed) {
        return false;
      }

      // Ground/Air filter
      if (filters.onGroundOnly && !ac.onGround) return false;
      if (filters.inAirOnly && ac.onGround) return false;

      return true;
    });

    console.log(`Filtered ${filtered.length} US aircraft from ${aircraft.length} total aircraft`);
    return filtered;
  }, [aircraft, searchQuery, filters]);

  const handleAircraftClick = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Plane className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Flight Info Today - US Airspace
              </h1>
              <p className="text-xs text-muted-foreground">
                Real-time aircraft monitoring
              </p>
            </div>
          </div>

          {loading && autoRefresh && (
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              Loading...
            </div>
          )}

          {!autoRefresh && !loading && aircraft.length === 0 && !error && (
            <div className="ml-auto text-sm text-yellow-400">
              ⏸ Auto-refresh disabled - Click "Start Tracking" to begin
            </div>
          )}

          {error && (
            <div className="ml-auto text-sm">
              {error.includes('Rate limit') ? (
                <div className="text-yellow-400 flex items-center gap-2">
                  <span>⚠️ Rate Limited - Wait 5-10 minutes</span>
                </div>
              ) : (
                <div className="text-red-400">{error}</div>
              )}
            </div>
          )}

          {!loading && !error && (
            <div className="ml-auto text-sm text-muted-foreground">
              <div>Total: {aircraft.length.toLocaleString()} aircraft</div>
              <div>US Airspace: {filteredAircraft.length.toLocaleString()} aircraft</div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-background/50 border-r border-border overflow-y-auto">
          <div className="p-4 space-y-4">
            <ControlPanel
              onRefresh={refresh}
              isRefreshing={loading}
              autoRefresh={autoRefresh}
              onAutoRefreshToggle={setAutoRefresh}
              refreshInterval={refreshInterval}
              onRefreshIntervalChange={setRefreshInterval}
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={setSearchQuery}
            />

            <StatsPanel aircraft={filteredAircraft} lastUpdate={lastUpdate} />

            {selectedAircraft && (
              <AircraftDetails
                aircraft={selectedAircraft}
                onClose={() => setSelectedAircraft(null)}
              />
            )}
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          {aircraft.length > 0 ? (
            <FlightMap
              aircraft={filteredAircraft}
              center={US_CENTER}
              zoom={5}
              selectedAircraft={selectedAircraft}
              onAircraftClick={handleAircraftClick}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
              <div className="text-center max-w-lg p-8">
                <Plane className="w-24 h-24 text-primary mx-auto mb-6 animate-pulse-slow" />

                {!autoRefresh && !loading && !error ? (
                  // Initial state - not started yet
                  <div>
                    <h2 className="text-3xl font-bold mb-4">
                      ✈️ Ready to Track Live Flights
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Start tracking real-time aircraft over US airspace using Airplanes.live - completely FREE with no API key required!
                    </p>
                    <button
                      onClick={() => {
                        setAutoRefresh(true);
                        refresh();
                      }}
                      className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      Start Live Tracking
                    </button>
                    <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border">
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p className="font-bold text-blue-300">Using Airplanes.live API 🎉</p>
                        <p>
                          <strong>100% FREE</strong> - No API key required! Rate limit: 1 request per second.
                        </p>
                        <p>
                          Community-driven ADS-B data from enthusiast receivers worldwide.
                        </p>
                        <p className="text-xs">
                          Auto-refresh is disabled by default. Once started, the app will update every {refreshInterval / 1000} seconds.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Loading or error state
                  <div>
                    <p className="text-lg text-muted-foreground mb-4">
                      {loading
                        ? 'Loading aircraft data from Airplanes.live...'
                        : 'No aircraft data available'
                      }
                    </p>
                    {error && (
                      <div className={`rounded-lg p-4 mb-4 ${
                        error.includes('Rate limit')
                          ? 'bg-yellow-900/20 border border-yellow-500'
                          : 'bg-red-900/20 border border-red-500'
                      }`}>
                        <p className={`text-sm ${error.includes('Rate limit') ? 'text-yellow-400' : 'text-red-400'}`}>
                          {error}
                        </p>
                        {error.includes('Rate limit') && (
                          <div className="text-xs text-muted-foreground mt-2 space-y-2">
                            <p>
                              Airplanes.live API limits: 1 request per second.
                            </p>
                            <p className="font-bold text-yellow-300">
                              ⏰ Please wait 60 seconds before trying again.
                            </p>
                            <p className="text-white">
                              Steps to recover:
                            </p>
                            <ol className="list-decimal list-inside text-left space-y-1 text-white">
                              <li>Wait 60 seconds</li>
                              <li>Increase refresh interval to 20-30 seconds in settings</li>
                              <li>Click "Start Tracking" again</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                    {!loading && !error && (
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>Try the following:</p>
                        <ul className="list-disc list-inside text-left">
                          <li>Check your internet connection</li>
                          <li>Open browser console (F12) for more details</li>
                          <li>Wait 60 seconds if you hit rate limits</li>
                          <li>Use Settings to disable/enable Auto Refresh</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border px-6 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Data provided by{' '}
            <a
              href="https://airplanes.live"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Airplanes.live
            </a>
            {' - 100% FREE, community-driven ADS-B data'}
          </div>
          <div>
            {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
