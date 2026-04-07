import * as SQLite from 'expo-sqlite';
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
  up: (tx: SQLite.SQLTransaction) => void;
}

const migrations: Migration[] = [
  {
    version: 1,
    up: (tx) => {
      tx.executeSql(CREATE_RIDES_TABLE);
      tx.executeSql(CREATE_RIDE_POINTS_TABLE);
      CREATE_INDEXES.forEach((sql) => tx.executeSql(sql));
    },
  },
];

const getSchemaVersion = (database: SQLite.WebSQLDatabase): Promise<number> => {
  return new Promise((resolve) => {
    database.transaction((tx) => {
      tx.executeSql(
        `SELECT value FROM settings WHERE key = ?`,
        [SCHEMA_VERSION_KEY],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(parseInt(result.rows.item(0).value, 10));
          } else {
            resolve(0);
          }
        },
        () => {
          resolve(0);
          return false;
        },
      );
    });
  });
};

const setSchemaVersion = (database: SQLite.WebSQLDatabase, version: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    database.transaction(
      (tx) => {
        tx.executeSql(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [
          SCHEMA_VERSION_KEY,
          version.toString(),
        ]);
      },
      (error) => reject(error),
      () => resolve(),
    );
  });
};

export const runMigrations = async (database: SQLite.WebSQLDatabase): Promise<void> => {
  // Ensure settings table exists first
  await new Promise<void>((resolve, reject) => {
    database.transaction(
      (tx) => {
        tx.executeSql(SETTINGS_TABLE);
      },
      (error) => reject(error),
      () => resolve(),
    );
  });

  const currentVersion = await getSchemaVersion(database);

  const pendingMigrations = migrations.filter((m) => m.version > currentVersion);

  for (const migration of pendingMigrations) {
    await new Promise<void>((resolve, reject) => {
      database.transaction(
        (tx) => {
          migration.up(tx);
        },
        (error) => reject(error),
        () => resolve(),
      );
    });
    await setSchemaVersion(database, migration.version);
  }

  if (pendingMigrations.length === 0 && currentVersion < CURRENT_VERSION) {
    await setSchemaVersion(database, CURRENT_VERSION);
  }
};
