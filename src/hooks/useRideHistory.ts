import { useState, useEffect, useCallback } from 'react';
import { getAllRides, deleteRide as dbDeleteRide, getRideStats } from '../database/database';
import { Ride, RideStats } from '../types/ride';

interface RideHistoryState {
  rides: Ride[];
  loading: boolean;
  error: string | null;
  stats: RideStats;
}

const defaultStats: RideStats = {
  totalRides: 0,
  totalDistance: 0,
  totalDuration: 0,
  avgMaxLeanAngle: 0,
  personalBestLeanAngle: 0,
  personalBestSpeed: 0,
};

export function useRideHistory() {
  const [state, setState] = useState<RideHistoryState>({
    rides: [],
    loading: true,
    error: null,
    stats: defaultStats,
  });

  const fetchRides = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [rides, stats] = await Promise.all([getAllRides(), getRideStats()]);
      setState({ rides, loading: false, error: null, stats });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load rides',
      }));
    }
  }, []);

  const deleteRide = useCallback(
    async (rideId: string) => {
      try {
        await dbDeleteRide(rideId);
        await fetchRides();
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to delete ride',
        }));
      }
    },
    [fetchRides],
  );

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  return {
    rides: state.rides,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    refreshRides: fetchRides,
    deleteRide,
  };
}
