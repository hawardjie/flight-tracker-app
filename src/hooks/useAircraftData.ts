import { useState, useEffect, useCallback } from 'react';
import { Aircraft } from '../types/aircraft';
import { getUSAircraftFromOpenSky } from '../services/openSkyApi';

interface UseAircraftDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseAircraftDataReturn {
  aircraft: Aircraft[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
}

export const useAircraftData = (options: UseAircraftDataOptions = {}): UseAircraftDataReturn => {
  const {
    autoRefresh = true, // ON by default - auto-load flights
    refreshInterval = 30000, // 30s default - OpenSky serves data at ~10s resolution; mind anonymous credit limits
  } = options;

  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAircraft = useCallback(async () => {
    console.log('[useAircraftData] fetchAircraft called');

    try {
      console.log('[useAircraftData] Clearing error state and setting loading...');
      setError(null);
      setLoading(true);

      console.log('[useAircraftData] ✈️ Fetching all US aircraft from OpenSky...');
      const data = await getUSAircraftFromOpenSky();

      console.log(`[useAircraftData] Received ${data.length} aircraft, updating state...`);
      setAircraft(data);
      setLastUpdate(new Date());
      console.log('[useAircraftData] ✅ State updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch aircraft data';
      console.error('[useAircraftData] ❌ Error occurred:', errorMessage);
      setError(errorMessage);

      // If rate limited, keep the old data visible
      if (errorMessage.includes('Rate limit')) {
        console.log('[useAircraftData] Rate limited - keeping existing aircraft data');
      }
    } finally {
      console.log('[useAircraftData] Setting loading to false...');
      setLoading(false);
      console.log('[useAircraftData] fetchAircraft completed');
    }
  }, []);

  // Initial fetch only if auto-refresh is enabled
  useEffect(() => {
    console.log('[useAircraftData] Initial fetch effect triggered, autoRefresh:', autoRefresh);
    if (autoRefresh) {
      console.log('[useAircraftData] Auto-refresh is ON, calling fetchAircraft...');
      fetchAircraft();
    } else {
      console.log('[useAircraftData] Auto-refresh is OFF, skipping initial fetch');
      setLoading(false); // Make sure loading is false when auto-refresh is off
    }
  }, [fetchAircraft, autoRefresh]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) {
      console.log('[useAircraftData] Auto-refresh interval not set (auto-refresh is OFF)');
      return;
    }

    console.log(`[useAircraftData] Setting up auto-refresh interval: ${refreshInterval}ms`);
    const interval = setInterval(() => {
      console.log('[useAircraftData] Auto-refresh interval triggered');
      fetchAircraft();
    }, refreshInterval);

    return () => {
      console.log('[useAircraftData] Cleaning up auto-refresh interval');
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, fetchAircraft]);

  return {
    aircraft,
    loading,
    error,
    lastUpdate,
    refresh: fetchAircraft,
  };
};
