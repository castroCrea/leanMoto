import { Share } from 'react-native';
import { Ride, RidePoint } from '../types/ride';

export function exportRideToJSON(ride: Ride, points: RidePoint[]): string {
  const exportData = {
    appVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    ride: {
      ...ride,
      startTimeISO: new Date(ride.startTime).toISOString(),
      endTimeISO: new Date(ride.endTime).toISOString(),
    },
    points: points.map((p) => ({
      ...p,
      timestampISO: new Date(p.timestamp).toISOString(),
    })),
    summary: {
      totalPoints: points.length,
      durationFormatted: `${Math.floor(ride.duration / 60)}m ${ride.duration % 60}s`,
      distanceKm: ride.distance.toFixed(2),
      maxSpeedKmh: ride.maxSpeed.toFixed(1),
      maxLeanAngleDeg: ride.maxLeanAngle.toFixed(1),
      riskScore: ride.riskScore.toFixed(0),
    },
  };
  return JSON.stringify(exportData, null, 2);
}

export async function shareRide(ride: Ride, points: RidePoint[]): Promise<void> {
  const json = exportRideToJSON(ride, points);
  const date = new Date(ride.startTime).toLocaleDateString();

  try {
    await Share.share({
      title: `LeanRide AI - Ride ${date}`,
      message: json,
    });
  } catch (error) {
    console.error('Failed to share ride:', error);
    throw error;
  }
}
