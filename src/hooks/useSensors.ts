import { useState, useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { AccelerometerData, GyroscopeData } from '../types/sensors';
import { LowPassFilter } from '../utils/filters';
import { SENSOR_UPDATE_INTERVAL } from '../services/sensorService';

interface SensorData {
  accelerometer: AccelerometerData;
  gyroscope: GyroscopeData;
  isAvailable: boolean;
}

const defaultAccel: AccelerometerData = { x: 0, y: 0, z: 1, timestamp: 0 };
const defaultGyro: GyroscopeData = { x: 0, y: 0, z: 0, timestamp: 0 };

export function useSensors(): SensorData {
  const [accelerometer, setAccelerometer] = useState<AccelerometerData>(defaultAccel);
  const [gyroscope, setGyroscope] = useState<GyroscopeData>(defaultGyro);
  const [isAvailable, setIsAvailable] = useState(false);

  const accelFilters = useRef({
    x: new LowPassFilter(0.15),
    y: new LowPassFilter(0.15),
    z: new LowPassFilter(0.15),
  });

  const gyroFilters = useRef({
    x: new LowPassFilter(0.2),
    y: new LowPassFilter(0.2),
    z: new LowPassFilter(0.2),
  });

  useEffect(() => {
    let accelSub: ReturnType<typeof Accelerometer.addListener> | null = null;
    let gyroSub: ReturnType<typeof Gyroscope.addListener> | null = null;

    const setup = async () => {
      const [accelAvail, gyroAvail] = await Promise.all([
        Accelerometer.isAvailableAsync(),
        Gyroscope.isAvailableAsync(),
      ]);

      setIsAvailable(accelAvail && gyroAvail);

      if (accelAvail) {
        Accelerometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL);
        accelSub = Accelerometer.addListener((data) => {
          const filtered: AccelerometerData = {
            x: accelFilters.current.x.filter(data.x),
            y: accelFilters.current.y.filter(data.y),
            z: accelFilters.current.z.filter(data.z),
            timestamp: Date.now(),
          };
          setAccelerometer(filtered);
        });
      }

      if (gyroAvail) {
        Gyroscope.setUpdateInterval(SENSOR_UPDATE_INTERVAL);
        gyroSub = Gyroscope.addListener((data) => {
          const filtered: GyroscopeData = {
            x: gyroFilters.current.x.filter(data.x),
            y: gyroFilters.current.y.filter(data.y),
            z: gyroFilters.current.z.filter(data.z),
            timestamp: Date.now(),
          };
          setGyroscope(filtered);
        });
      }
    };

    setup();

    return () => {
      accelSub?.remove();
      gyroSub?.remove();
    };
  }, []);

  return { accelerometer, gyroscope, isAvailable };
}
