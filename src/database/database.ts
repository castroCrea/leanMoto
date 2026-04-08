import { openDatabaseSync, type SQLiteBindValue } from 'expo-sqlite';
import { Ride, RidePoint, RideStats } from '../types/ride';
import { CREATE_RIDES_TABLE, CREATE_RIDE_POINTS_TABLE, CREATE_INDEXES } from './schema';

const database = openDatabaseSync('leanride.db');

const setupStatements = [CREATE_RIDES_TABLE, CREATE_RIDE_POINTS_TABLE, ...CREATE_INDEXES];

export const initDatabase = async (): Promise<void> => {
  await database.withTransactionAsync(async () => {
    for (const statement of setupStatements) {
      await database.execAsync(statement);
    }
  });
};

export const saveRide = async (ride: Ride): Promise<void> => {
  await database.runAsync(
    `INSERT OR REPLACE INTO rides
      (id, startTime, endTime, duration, distance, avgSpeed, maxSpeed,
       maxLeanAngle, leftMaxAngle, rightMaxAngle, riskScore)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ride.id,
    ride.startTime,
    ride.endTime,
    ride.duration,
    ride.distance,
    ride.avgSpeed,
    ride.maxSpeed,
    ride.maxLeanAngle,
    ride.leftMaxAngle,
    ride.rightMaxAngle,
    ride.riskScore,
  );
};

export const updateRide = async (rideId: string, updates: Partial<Ride>): Promise<void> => {
  const entries = Object.entries(updates).filter(([key]) => key !== 'id' && key !== 'points');

  if (entries.length === 0) {
    return;
  }

  const fields = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value as SQLiteBindValue);

  await database.runAsync(`UPDATE rides SET ${fields} WHERE id = ?`, ...values, rideId);
};

export const getRide = async (rideId: string): Promise<Ride | null> => {
  return await database.getFirstAsync<Ride>('SELECT * FROM rides WHERE id = ?', rideId);
};

export const getAllRides = async (): Promise<Ride[]> => {
  return await database.getAllAsync<Ride>('SELECT * FROM rides ORDER BY startTime DESC');
};

export const deleteRide = async (rideId: string): Promise<void> => {
  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM ride_points WHERE rideId = ?', rideId);
    await database.runAsync('DELETE FROM rides WHERE id = ?', rideId);
  });
};

export const saveRidePoint = async (point: RidePoint): Promise<void> => {
  await database.runAsync(
    `INSERT INTO ride_points
      (rideId, timestamp, latitude, longitude, speed,
       leanAngle, acceleration, gForceX, gForceY, gForceZ)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    point.rideId,
    point.timestamp,
    point.latitude,
    point.longitude,
    point.speed,
    point.leanAngle,
    point.acceleration,
    point.gForceX,
    point.gForceY,
    point.gForceZ,
  );
};

export const saveRidePoints = async (points: RidePoint[]): Promise<void> => {
  if (points.length === 0) {
    return;
  }

  await database.withTransactionAsync(async () => {
    for (const point of points) {
      await database.runAsync(
        `INSERT INTO ride_points
          (rideId, timestamp, latitude, longitude, speed,
           leanAngle, acceleration, gForceX, gForceY, gForceZ)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        point.rideId,
        point.timestamp,
        point.latitude,
        point.longitude,
        point.speed,
        point.leanAngle,
        point.acceleration,
        point.gForceX,
        point.gForceY,
        point.gForceZ,
      );
    }
  });
};

export const getRidePoints = async (rideId: string): Promise<RidePoint[]> => {
  return await database.getAllAsync<RidePoint>(
    'SELECT * FROM ride_points WHERE rideId = ? ORDER BY timestamp ASC',
    rideId,
  );
};

export const getRideStats = async (): Promise<RideStats> => {
  const stats = await database.getFirstAsync<RideStats>(
    `SELECT
      COUNT(*) as totalRides,
      COALESCE(SUM(distance), 0) as totalDistance,
      COALESCE(SUM(duration), 0) as totalDuration,
      COALESCE(AVG(maxLeanAngle), 0) as avgMaxLeanAngle,
      COALESCE(MAX(maxLeanAngle), 0) as personalBestLeanAngle,
      COALESCE(MAX(maxSpeed), 0) as personalBestSpeed
    FROM rides`,
  );

  return (
    stats ?? {
      totalRides: 0,
      totalDistance: 0,
      totalDuration: 0,
      avgMaxLeanAngle: 0,
      personalBestLeanAngle: 0,
      personalBestSpeed: 0,
    }
  );
};

export const db = database;
