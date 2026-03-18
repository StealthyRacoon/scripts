// lib/db.ts
import path from 'node:path';
import Database from 'better-sqlite3';

declare global {
  var __db__: Database.Database | undefined;
}

const dbPath =
  process.env.SQLITE_PATH ??
  path.resolve(process.cwd(), '.Permissions.db');
console.log('SQLite DB path:', dbPath);

const db = global.__db__ ?? new Database(dbPath);
db.pragma('journal_mode = WAL');

if (process.env.NODE_ENV !== 'production') global.__db__ = db;

// --- Helper functions ---
export const getSharePointPermissions = () => {
  return db.prepare('SELECT * FROM SharePointPermissions').all();
};

export const getSharePointSites = () => {
  return db.prepare("SELECT * FROM SharePointPermissions WHERE ObjectType = 'Site'").all();
};

export const getPermissionsBySite = (siteUrl: string) => {
  return db
    .prepare("SELECT * FROM SharePointPermissions WHERE URL = ? AND ObjectType != 'Site'")
    .all(siteUrl);
};

export default db;