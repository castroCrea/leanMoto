import { useState, useRef, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { useSensors } from './useSensors';
import { useRideStore } from '../store/rideStore';
import { useSettingsStore } from '../store/settingsStore';
import { calculateLeanAngle, getLeanOrientation } from '../services/leanAngleService';
import { calculateGForce, processAccelerometerData } from '../services/sensorService';
import { distanceBetweenCoords, msToKmh } from '../utils/calculations';
import { saveRidePoints } from '../database/database';
import { RidePoint } from '../types/ride';
import { AccelerometerData, CalibrationData } from '../types/sensors';

const POINTS_FLUSH_THRESHOLD = 10;

export function useRideTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const { accelerometer, gyroscope, isAvailable } = useSensors();
  const { isRiding, currentRide, updateMetrics } = useRideStore();
  const { mountAngle, calibrationOffsets, setCalibrationOffsets, recordLeanAtLowSpeed } = useSettingsStore();

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastCoords = useRef<{ lat: number; lon: number } | null>(null);
  const pointBuffer = useRef<RidePoint[]>([]);
  const accumulatedDistance = useRef(0);
  const startTime = useRef<number>(Date.now());

  // Refs to avoid stale closures inside the location callback.
  // accelerometerRef is initialised from the current state and kept in sync via the
  // effect below, so it always holds a current reading when startTracking is called.
  const accelerometerRef = useRef<AccelerometerData>(accelerometer);
  const leanAngleRef = useRef(0);
  const gForceRef = useRef(0);
  const calibratedAccelRef = useRef<AccelerometerData>({ x: 0, y: 0, z: 1, timestamp: 0 });
  const lastMetricsUpdateRef = useRef(0);

  // Keep accelerometerRef in sync with the latest sensor data
  useEffect(() => {
    accelerometerRef.current = accelerometer;
  }, [accelerometer]);

  // Update lean angle and g-force metrics on every accelerometer reading while tracking.
  // This ensures the angle display refreshes at the sensor rate (~60 Hz) rather than
  // only at the GPS location update rate (~1 Hz).
  // We throttle store updates to ~30 Hz to reduce unnecessary re-renders while
  // still keeping the refs (used by the location callback) always up-to-date.
  useEffect(() => {
    if (!isTracking) return;

    const calibration: CalibrationData = {
      offsetX: calibrationOffsets.x,
      offsetY: calibrationOffsets.y,
      offsetZ: calibrationOffsets.z,
      mountAngle,
    };

    const calibratedAccel = processAccelerometerData(accelerometer, calibration);
    const { isPortrait, gravityAxisSign, gravityMagnitude } = getLeanOrientation(calibrationOffsets);
    const leanAngle = calculateLeanAngle(calibratedAccel, isPortrait, gravityAxisSign, gravityMagnitude);
    const gForce = calculateGForce(calibratedAccel);

    // Keep refs in sync so the location callback can record the latest values
    leanAngleRef.current = leanAngle;
    gForceRef.current = gForce;
    calibratedAccelRef.current = calibratedAccel;

    const now = Date.now();
    if (now - lastMetricsUpdateRef.current < 33) return; // throttle to ~30 Hz
    lastMetricsUpdateRef.current = now;

    updateMetrics({
      leanAngle,
      gForce,
      gForceX: calibratedAccel.x,
      gForceY: calibratedAccel.y,
      gForceZ: calibratedAccel.z,
    });
  }, [accelerometer, isTracking, calibrationOffsets, mountAngle, updateMetrics]);

  // Ref to avoid stale closure for recordLeanAtLowSpeed inside the location callback.
  const recordLeanAtLowSpeedRef = useRef(recordLeanAtLowSpeed);
  useEffect(() => {
    recordLeanAtLowSpeedRef.current = recordLeanAtLowSpeed;
  }, [recordLeanAtLowSpeed]);

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
    // Auto-calibrate sensors at ride start: capture the current accelerometer
    // reading as the neutral/upright reference so the lean angle starts at 0°.
    const currentAccel = accelerometerRef.current;
    setCalibrationOffsets({
      x: currentAccel.x,
      y: currentAccel.y,
      z: currentAccel.z, // store full gravity vector for 3-D mount support
    });

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

        const elapsedTime = Math.floor((Date.now() - startTime.current) / 1000);

        // Lean angle and g-force are kept up-to-date by the accelerometer effect;
        // the location callback only needs to update GPS-derived metrics.
        updateMetrics({
          speed: speedKmh,
          heading: heading ?? 0,
          altitude: altitude ?? 0,
          distance: accumulatedDistance.current,
          elapsedTime,
        });

        if (isRiding && currentRide?.id) {
          const LOW_SPEED_THRESHOLD_KMH = 10;
          const recordLean =
            recordLeanAtLowSpeedRef.current || speedKmh >= LOW_SPEED_THRESHOLD_KMH;
          const point: RidePoint = {
            rideId: currentRide.id,
            timestamp: Date.now(),
            latitude,
            longitude,
            speed: speedKmh,
            leanAngle: recordLean ? leanAngleRef.current : 0,
            acceleration: gForceRef.current,
            gForceX: calibratedAccelRef.current.x,
            gForceY: calibratedAccelRef.current.y,
            gForceZ: calibratedAccelRef.current.z,
          };

          pointBuffer.current.push(point);

          if (pointBuffer.current.length >= POINTS_FLUSH_THRESHOLD) {
            flushPoints();
          }
        }
      },
    );
  }, [isRiding, currentRide, updateMetrics, flushPoints, setCalibrationOffsets]);
  // Note: accelerometer, calibrationOffsets, and mountAngle are intentionally
  // omitted from this dependency array. The location subscription is set up once
  // and reads sensor data through refs (accelerometerRef, leanAngleRef, etc.) to
  // avoid recreating the subscription on every sensor tick. Lean angle and g-force
  // metrics are kept current by the dedicated accelerometer useEffect above.

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
