import { useState } from 'react';
import { RefreshCw, Filter, Settings, Search, X } from 'lucide-react';
import { FilterOptions } from '../types/aircraft';

interface ControlPanelProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  autoRefresh: boolean;
  onAutoRefreshToggle: (enabled: boolean) => void;
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onSearch: (query: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onRefresh,
  isRefreshing,
  autoRefresh,
  onAutoRefreshToggle,
  refreshInterval,
  onRefreshIntervalChange,
  filters,
  onFiltersChange,
  onSearch,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold flex-1">Controls</h2>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="control-button p-2"
          title="Refresh now"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`control-button p-2 ${showFilters ? 'bg-primary text-primary-foreground' : ''}`}
          title="Toggle filters"
        >
          <Filter className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`control-button p-2 ${showSettings ? 'bg-primary text-primary-foreground' : ''}`}
          title="Toggle settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by callsign or ICAO24..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input-field w-full pl-10 pr-8"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-3 p-3 bg-secondary/50 rounded-lg border border-border space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Auto Refresh</label>
            <button
              onClick={() => onAutoRefreshToggle(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRefresh ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {autoRefresh && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Refresh Interval: {refreshInterval / 1000}s
              </label>
              <input
                type="range"
                min="15000"
                max="60000"
                step="5000"
                value={refreshInterval}
                onChange={(e) => onRefreshIntervalChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>15s</span>
                <span>60s</span>
              </div>
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ OpenSky API limit: 10 requests per 10 seconds. Use 15s+ to avoid rate limits.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-3 bg-secondary/50 rounded-lg border border-border space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Altitude Range (ft)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minAltitude || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, minAltitude: Number(e.target.value) || 0 })
                }
                className="input-field flex-1 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxAltitude || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, maxAltitude: Number(e.target.value) || 50000 })
                }
                className="input-field flex-1 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Speed Range (kts)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minSpeed || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, minSpeed: Number(e.target.value) || 0 })
                }
                className="input-field flex-1 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxSpeed || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, maxSpeed: Number(e.target.value) || 1000 })
                }
                className="input-field flex-1 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onGroundOnly}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    onGroundOnly: e.target.checked,
                    inAirOnly: false,
                  })
                }
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">Show only grounded aircraft</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inAirOnly}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    inAirOnly: e.target.checked,
                    onGroundOnly: false,
                  })
                }
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">Show only airborne aircraft</span>
            </label>
          </div>

          <button
            onClick={() =>
              onFiltersChange({
                minAltitude: 0,
                maxAltitude: 50000,
                minSpeed: 0,
                maxSpeed: 1000,
                countries: [],
                onGroundOnly: false,
                inAirOnly: false,
              })
            }
            className="control-button w-full text-sm"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
