import { useState, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useSensors } from './useSensors';
import { useRideStore } from '../store/rideStore';
import { useSettingsStore } from '../store/settingsStore';
import { calculateLeanAngle } from '../services/leanAngleService';
import { calculateGForce, processAccelerometerData } from '../services/sensorService';
import { distanceBetweenCoords, msToKmh } from '../utils/calculations';
import { saveRidePoints } from '../database/database';
import { RidePoint } from '../types/ride';
import { CalibrationData } from '../types/sensors';

const POINTS_FLUSH_THRESHOLD = 10;

export function useRideTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const { accelerometer, gyroscope, isAvailable } = useSensors();
  const { isRiding, currentRide, updateMetrics } = useRideStore();
  const { mountAngle, calibrationOffsets } = useSettingsStore();

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastCoords = useRef<{ lat: number; lon: number } | null>(null);
  const pointBuffer = useRef<RidePoint[]>([]);
  const accumulatedDistance = useRef(0);
  const startTime = useRef<number>(Date.now());

  const flushPoints = useCallback(async () => {
    if (pointBuffer.current.length === 0) return;
    const toFlush = [...pointBuffer.current];
    pointBuffer.current = [];
    try {
      await saveRidePoints(toFlush);
    } catch (error) {
      console.error('Failed to flush ride points:', error);
    }
  }, []);

  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
    }

    accumulatedDistance.current = 0;
    lastCoords.current = null;
    pointBuffer.current = [];
    startTime.current = Date.now();
    setIsTracking(true);

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        const { latitude, longitude, speed, altitude, heading } = location.coords;
        const speedKmh = speed != null && speed >= 0 ? msToKmh(speed) : 0;

        if (lastCoords.current) {
          const delta = distanceBetweenCoords(
            lastCoords.current.lat,
            lastCoords.current.lon,
            latitude,
            longitude,
          );
          accumulatedDistance.current += delta;
        }
        lastCoords.current = { lat: latitude, lon: longitude };

        const calibration: CalibrationData = {
          offsetX: calibrationOffsets.x,
          offsetY: calibrationOffsets.y,
          offsetZ: calibrationOffsets.z,
          mountAngle,
        };

        const calibratedAccel = processAccelerometerData(accelerometer, calibration);
        const leanAngle = calculateLeanAngle(calibratedAccel);
        const gForce = calculateGForce(calibratedAccel);
        const elapsedTime = Math.floor((Date.now() - startTime.current) / 1000);

        updateMetrics({
          leanAngle,
          speed: speedKmh,
          gForce,
          gForceX: calibratedAccel.x,
          gForceY: calibratedAccel.y,
          gForceZ: calibratedAccel.z,
          heading: heading ?? 0,
          altitude: altitude ?? 0,
          distance: accumulatedDistance.current,
          elapsedTime,
        });

        if (isRiding && currentRide?.id) {
          const point: RidePoint = {
            rideId: currentRide.id,
            timestamp: Date.now(),
            latitude,
            longitude,
            speed: speedKmh,
            leanAngle,
            acceleration: gForce,
            gForceX: calibratedAccel.x,
            gForceY: calibratedAccel.y,
            gForceZ: calibratedAccel.z,
          };

          pointBuffer.current.push(point);

          if (pointBuffer.current.length >= POINTS_FLUSH_THRESHOLD) {
            flushPoints();
          }
        }
      },
    );
  }, [accelerometer, calibrationOffsets, mountAngle, isRiding, currentRide, updateMetrics, flushPoints]);

  const stopTracking = useCallback(async () => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    await flushPoints();
    setIsTracking(false);
  }, [flushPoints]);

  return {
    startTracking,
    stopTracking,
    isTracking,
    isAvailable,
    accelerometer,
    gyroscope,
  };
}
