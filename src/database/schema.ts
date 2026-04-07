export const CREATE_RIDES_TABLE = `
  CREATE TABLE IF NOT EXISTS rides (
    id TEXT PRIMARY KEY,
    startTime INTEGER NOT NULL,
    endTime INTEGER,
    duration INTEGER,
    distance REAL DEFAULT 0,
    avgSpeed REAL DEFAULT 0,
    maxSpeed REAL DEFAULT 0,
    maxLeanAngle REAL DEFAULT 0,
    leftMaxAngle REAL DEFAULT 0,
    rightMaxAngle REAL DEFAULT 0,
    riskScore REAL DEFAULT 0
  );
`;

export const CREATE_RIDE_POINTS_TABLE = `
  CREATE TABLE IF NOT EXISTS ride_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rideId TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    latitude REAL,
    longitude REAL,
    speed REAL DEFAULT 0,
    leanAngle REAL DEFAULT 0,
    acceleration REAL DEFAULT 0,
    gForceX REAL DEFAULT 0,
    gForceY REAL DEFAULT 0,
    gForceZ REAL DEFAULT 0,
    FOREIGN KEY (rideId) REFERENCES rides(id)
  );
`;

export const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_rides_startTime ON rides(startTime);`,
  `CREATE INDEX IF NOT EXISTS idx_ride_points_rideId ON ride_points(rideId);`,
];
