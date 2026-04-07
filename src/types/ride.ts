export interface RidePoint {
  id?: number;
  rideId: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  speed: number; // km/h
  leanAngle: number; // degrees, negative = left, positive = right
  acceleration: number; // G-force magnitude
  gForceX: number;
  gForceY: number;
  gForceZ: number;
}

export interface Ride {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // seconds
  distance: number; // km
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
  maxLeanAngle: number; // degrees (absolute max)
  leftMaxAngle: number; // negative value, max left lean
  rightMaxAngle: number; // positive value, max right lean
  riskScore: number; // 0-100
  points?: RidePoint[];
}

export interface RealTimeMetrics {
  leanAngle: number;
  speed: number;
  gForce: number;
  gForceX: number;
  gForceY: number;
  gForceZ: number;
  heading: number;
  altitude: number;
  maxLeanAngleSession: number;
  maxSpeedSession: number;
  leftMaxAngle: number;
  rightMaxAngle: number;
  distance: number;
  elapsedTime: number;
}

export interface RideInsight {
  id: string;
  type: 'info' | 'warning' | 'achievement' | 'tip';
  title: string;
  description: string;
  value?: number;
  unit?: string;
  timestamp: number;
}

export interface RideStats {
  totalRides: number;
  totalDistance: number;
  totalDuration: number;
  avgMaxLeanAngle: number;
  personalBestLeanAngle: number;
  personalBestSpeed: number;
}
