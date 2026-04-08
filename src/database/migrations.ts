import type { SQLiteDatabase } from 'expo-sqlite';
import { CREATE_RIDES_TABLE, CREATE_RIDE_POINTS_TABLE, CREATE_INDEXES } from './schema';

const SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

const SCHEMA_VERSION_KEY = 'schema_version';
const CURRENT_VERSION = 1;

interface Migration {
  version: number;
  up: (database: SQLiteDatabase) => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    up: async (database) => {
      await database.execAsync(CREATE_RIDES_TABLE);
      await database.execAsync(CREATE_RIDE_POINTS_TABLE);
      for (const sql of CREATE_INDEXES) {
        await database.execAsync(sql);
      }
    },
  },
];

const getSchemaVersion = async (database: SQLiteDatabase): Promise<number> => {
  const result = await database.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings WHERE key = ?`,
    SCHEMA_VERSION_KEY,
  );

  return result ? parseInt(result.value, 10) : 0;
};

const setSchemaVersion = async (database: SQLiteDatabase, version: number): Promise<void> => {
  await database.runAsync(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [
    SCHEMA_VERSION_KEY,
    version.toString(),
  ]);
};

export const runMigrations = async (database: SQLiteDatabase): Promise<void> => {
  await database.execAsync(SETTINGS_TABLE);

  const currentVersion = await getSchemaVersion(database);
  const pendingMigrations = migrations.filter((migration) => migration.version > currentVersion);

  for (const migration of pendingMigrations) {
    await database.withTransactionAsync(async () => {
      await migration.up(database);
      await setSchemaVersion(database, migration.version);
    });
  }

  if (pendingMigrations.length === 0 && currentVersion < CURRENT_VERSION) {
    await setSchemaVersion(database, CURRENT_VERSION);
  }
};
