import { AccelerometerData } from '../types/sensors';
import { CalibrationData } from '../types/sensors';

export const SENSOR_UPDATE_INTERVAL = 16; // ms (~60Hz)

export function processAccelerometerData(
  raw: AccelerometerData,
  calibration: CalibrationData,
): AccelerometerData {
  return {
    x: raw.x - calibration.offsetX,
    y: raw.y - calibration.offsetY,
    z: raw.z - calibration.offsetZ,
    timestamp: raw.timestamp,
  };
}

export function calculateGForce(accel: AccelerometerData): number {
  return Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
}
