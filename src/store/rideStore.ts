import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Ride, RealTimeMetrics, RideInsight } from '../types/ride';
import { saveRide } from '../database/database';
import { calculateRiskScore } from '../services/leanAngleService';

interface RideStore {
  isRiding: boolean;
  currentRide: Partial<Ride> | null;
  currentMetrics: RealTimeMetrics;
  insights: RideInsight[];

  startRide: () => void;
  stopRide: () => Promise<void>;
  updateMetrics: (metrics: Partial<RealTimeMetrics>) => void;
  addInsight: (insight: RideInsight) => void;
  clearInsights: () => void;
}

const defaultMetrics: RealTimeMetrics = {
  leanAngle: 0,
  speed: 0,
  gForce: 0,
  gForceX: 0,
  gForceY: 0,
  gForceZ: 0,
  heading: 0,
  altitude: 0,
  maxLeanAngleSession: 0,
  maxSpeedSession: 0,
  leftMaxAngle: 0,
  rightMaxAngle: 0,
  distance: 0,
  elapsedTime: 0,
};

export const useRideStore = create<RideStore>((set, get) => ({
  isRiding: false,
  currentRide: null,
  currentMetrics: { ...defaultMetrics },
  insights: [],

  startRide: () => {
    const rideId = uuidv4();
    const startTime = Date.now();
    set({
      isRiding: true,
      currentRide: {
        id: rideId,
        startTime,
        endTime: 0,
        duration: 0,
        distance: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        maxLeanAngle: 0,
        leftMaxAngle: 0,
        rightMaxAngle: 0,
        riskScore: 0,
      },
      currentMetrics: { ...defaultMetrics },
      insights: [],
    });
  },

  stopRide: async () => {
    const { currentRide, currentMetrics } = get();
    if (!currentRide || !currentRide.id) return;

    const endTime = Date.now();
    const duration = Math.floor((endTime - (currentRide.startTime ?? endTime)) / 1000);

    const riskScore = calculateRiskScore(
      currentMetrics.maxLeanAngleSession,
      currentMetrics.maxSpeedSession,
      currentMetrics.speed,
    );

    const finalRide: Ride = {
      id: currentRide.id,
      startTime: currentRide.startTime ?? endTime,
      endTime,
      duration,
      distance: currentMetrics.distance,
      avgSpeed: duration > 0 ? (currentMetrics.distance / (duration / 3600)) : 0,
      maxSpeed: currentMetrics.maxSpeedSession,
      maxLeanAngle: currentMetrics.maxLeanAngleSession,
      leftMaxAngle: currentMetrics.leftMaxAngle,
      rightMaxAngle: currentMetrics.rightMaxAngle,
      riskScore,
    };

    try {
      await saveRide(finalRide);
    } catch (error) {
      console.error('Failed to save ride:', error);
    }

    set({
      isRiding: false,
      currentRide: finalRide,
      currentMetrics: { ...defaultMetrics },
    });
  },

  updateMetrics: (metrics: Partial<RealTimeMetrics>) => {
    set((state) => {
      const updated = { ...state.currentMetrics, ...metrics };

      // Track session maximums
      const absLean = Math.abs(updated.leanAngle);
      if (absLean > updated.maxLeanAngleSession) {
        updated.maxLeanAngleSession = absLean;
      }
      if (updated.speed > updated.maxSpeedSession) {
        updated.maxSpeedSession = updated.speed;
      }
      if (updated.leanAngle < updated.leftMaxAngle) {
        updated.leftMaxAngle = updated.leanAngle;
      }
      if (updated.leanAngle > updated.rightMaxAngle) {
        updated.rightMaxAngle = updated.leanAngle;
      }

      return { currentMetrics: updated };
    });
  },

  addInsight: (insight: RideInsight) => {
    set((state) => ({ insights: [...state.insights, insight] }));
  },

  clearInsights: () => set({ insights: [] }),
}));
