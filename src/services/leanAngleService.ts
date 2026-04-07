import { AccelerometerData, GyroscopeData } from '../types/sensors';

export function calculateLeanAngle(accel: AccelerometerData): number {
  // Returns degrees: negative = left lean, positive = right lean
  return Math.atan2(accel.y, accel.z) * (180 / Math.PI);
}

export function calculateRollRate(gyro: GyroscopeData): number {
  // Roll rate around the X axis in degrees/second
  return gyro.x * (180 / Math.PI);
}

export type LeanZone = 'safe' | 'moderate' | 'aggressive' | 'extreme';

export function classifyLeanZone(angle: number): LeanZone {
  const abs = Math.abs(angle);
  if (abs < 20) return 'safe';
  if (abs < 35) return 'moderate';
  if (abs < 45) return 'aggressive';
  return 'extreme';
}

export function calculateRiskScore(
  maxLean: number,
  maxSpeed: number,
  avgSpeed: number,
): number {
  // Weighted risk score 0-100
  const leanScore = Math.min((maxLean / 60) * 40, 40); // max 40 points
  const maxSpeedScore = Math.min((maxSpeed / 200) * 35, 35); // max 35 points
  const avgSpeedScore = Math.min((avgSpeed / 120) * 25, 25); // max 25 points
  return Math.round(leanScore + maxSpeedScore + avgSpeedScore);
}
