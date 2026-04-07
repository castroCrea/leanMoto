import * as SQLite from 'expo-sqlite';
import { Ride, RidePoint, RideStats } from '../types/ride';
import { CREATE_RIDES_TABLE, CREATE_RIDE_POINTS_TABLE, CREATE_INDEXES } from './schema';

const database = SQLite.openDatabase('leanride.db');

export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    database.transaction(
      (tx) => {
        tx.executeSql(CREATE_RIDES_TABLE);
        tx.executeSql(CREATE_RIDE_POINTS_TABLE);
        CREATE_INDEXES.forEach((sql) => tx.executeSql(sql));
      },
      (error) => {
        console.error('Database init error:', error);
        reject(error);
      },
      () => resolve(),
    );
  });
};

export const saveRide = (ride: Ride): Promise<void> => {
  return new Promise((resolve, reject) => {
    database.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO rides
            (id, startTime, endTime, duration, distance, avgSpeed, maxSpeed,
             maxLeanAngle, leftMaxAngle, rightMaxAngle, riskScore)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
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
          ],
        );
      },
      (error) => reject(error),
      () => resolve(),
    );
  });
};

export const updateRide = (rideId: string, updates: Partial<Ride>): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(updates)
      .filter((k) => k !== 'id' && k !== 'points')
      .map((k) => `${k} = ?`)
      .join(', ');
    const values = Object.keys(updates)
      .filter((k) => k !== 'id' && k !== 'points')
      .map((k) => (updates as Record<string, unknown>)[k]);

    if (!fields) {
      resolve();
      return;
    }

    database.transaction(
      (tx) => {
        tx.executeSql(`UPDATE rides SET ${fields} WHERE id = ?`, [...values, rideId]);
      },
      (error) => reject(error),
      () => resolve(),
    );
  });
};

export const getRide = (rideId: string): Promise<Ride | null> => {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM rides WHERE id = ?',
        [rideId],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0) as Ride);
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getAllRides = (): Promise<Ride[]> => {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM rides ORDER BY startTime DESC',
        [],
        (_, result) => {
          const rides: Ride[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            rides.push(result.rows.item(i) as Ride);
          }
          resolve(rides);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const deleteRide = (rideId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    database.transaction(
      (tx) => {
        tx.executeSql('DELETE FROM ride_points WHERE rideId = ?', [rideId]);
        tx.executeSql('DELETE FROM rides WHERE id = ?', [rideId]);
      },
      (error) => reject(error),
      () => resolve(),
    );
  });
};

export const saveRidePoint = (point: RidePoint): Promise<void> => {
  return new Promise((resolve, reject) => {
    database.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO ride_points
            (rideId, timestamp, latitude, longitude, speed,
             leanAngle, acceleration, gForceX, gForceY, gForceZ)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
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
          ],
        );
      },
      (error) => reject(error),
      () => resolve(),
    );
  });
};

export const saveRidePoints = (points: RidePoint[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (points.length === 0) {
      resolve();
      return;
    }
    database.transaction(
      (tx) => {
        points.forEach((point) => {
          tx.executeSql(
            `INSERT INTO ride_points
              (rideId, timestamp, latitude, longitude, speed,
               leanAngle, acceleration, gForceX, gForceY, gForceZ)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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
            ],
          );
        });
      },
      (error) => reject(error),
      () => resolve(),
    );
  });
};

export const getRidePoints = (rideId: string): Promise<RidePoint[]> => {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM ride_points WHERE rideId = ? ORDER BY timestamp ASC',
        [rideId],
        (_, result) => {
          const points: RidePoint[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            points.push(result.rows.item(i) as RidePoint);
          }
          resolve(points);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getRideStats = (): Promise<RideStats> => {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `SELECT
          COUNT(*) as totalRides,
          COALESCE(SUM(distance), 0) as totalDistance,
          COALESCE(SUM(duration), 0) as totalDuration,
          COALESCE(AVG(maxLeanAngle), 0) as avgMaxLeanAngle,
          COALESCE(MAX(maxLeanAngle), 0) as personalBestLeanAngle,
          COALESCE(MAX(maxSpeed), 0) as personalBestSpeed
        FROM rides`,
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0) as RideStats);
          } else {
            resolve({
              totalRides: 0,
              totalDistance: 0,
              totalDuration: 0,
              avgMaxLeanAngle: 0,
              personalBestLeanAngle: 0,
              personalBestSpeed: 0,
            });
          }
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const db = database;
