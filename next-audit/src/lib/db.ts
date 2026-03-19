import sqlite3 from 'sqlite3';
import path from 'path';
import { open } from 'sqlite';

// Enable verbose mode (optional)
sqlite3.verbose();

// Create a reusable DB connection
const dbPromise = open({
  filename: path.join(process.cwd(), 'lib', 'Permissions.db'),
  driver: sqlite3.Database,
});

// --- Queries ---

export const getSharePointPermissions = async () => {
  const db = await dbPromise;
  return db.all('SELECT * FROM SharePointPermissions');
};

export const getSharePointSites = async () => {
  const db = await dbPromise;
  return db.all(
    "SELECT * FROM SharePointPermissions WHERE ObjectType = 'Site'"
  );
};

export const getPermissionsBySite = async (siteUrl: string) => {
  const db = await dbPromise;
  return db.all(
    "SELECT * FROM SharePointPermissions WHERE URL = ? AND ObjectType != 'Site'",
    [siteUrl]
  );
};

export default dbPromise;