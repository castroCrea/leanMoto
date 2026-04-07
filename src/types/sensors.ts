export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface GyroscopeData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface SensorState {
  accelerometer: AccelerometerData;
  gyroscope: GyroscopeData;
  isAvailable: boolean;
  isActive: boolean;
}

export interface CalibrationData {
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  mountAngle: number; // phone mount angle offset in degrees
}
