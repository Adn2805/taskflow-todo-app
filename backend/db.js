import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env variables
dotenv.config();

let db;

/**
 * Initialize and return the Turso/LibSQL database client.
 */
export async function initDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables must be set.');
  }

  db = createClient({
    url,
    authToken,
  });

  // Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
      due_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      todo_id INTEGER,
      action TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

/**
 * Get the database instance.
 */
export function getDb() {
  if (!db) throw new Error("Database not initialized yet.");
  return db;
}

/**
 * Helper: Run a query and return results as array of objects.
 */
export async function queryAll(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows;
}

/**
 * Helper: Run a query and return single row as object (or null).
 */
export async function queryOne(sql, args = []) {
  const rows = await queryAll(sql, args);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Helper: Run an INSERT/UPDATE/DELETE statement.
 */
export async function runSql(sql, args = []) {
  return await db.execute({ sql, args });
}
