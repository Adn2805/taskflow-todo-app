import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'todos.db');

let db;

/**
 * Initialize and return the SQLite database.
 * Uses sql.js (pure JS/WASM) — no native build tools needed.
 * Persists data to a file on disk after every write operation.
 */
export async function initDb() {
  const SQL = await initSqlJs();

  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  db.run(`
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

  db.run(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      todo_id INTEGER,
      action TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Database starts empty on first run

  return db;
}

/**
 * Save the database state to a file.
 * Call this after every write operation to persist data.
 */
export function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
  }
}

/**
 * Get the database instance.
 */
export function getDb() {
  return db;
}

/**
 * Helper: Run a SELECT query and return results as array of objects.
 */
export function queryAll(sql, params = {}) {
  const stmt = db.prepare(sql);
  if (Object.keys(params).length > 0) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

/**
 * Helper: Run a SELECT query and return single row as object (or null).
 */
export function queryOne(sql, params = {}) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Helper: Run an INSERT/UPDATE/DELETE statement.
 */
export function runSql(sql, params = {}) {
  db.run(sql, params);
  saveDb();
}

/**
 * Get the last inserted row ID.
 */
export function lastInsertRowId() {
  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0].values[0][0];
}

function seedDatabase() {
  const now = new Date();

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
  };

  const seedData = [
    {
      title: 'Design system architecture',
      description: 'Plan the microservices architecture including API gateway, service mesh, and inter-service communication patterns. Document decisions in ADRs.',
      priority: 'high',
      status: 'pending',
      due_date: addDays(now, 3),
      created_at: addDays(now, -2),
      updated_at: addDays(now, -2),
    },
    {
      title: 'Write unit tests for auth module',
      description: 'Cover login, registration, token refresh, and password reset flows. Target 90% branch coverage.',
      priority: 'high',
      status: 'completed',
      due_date: null,
      created_at: addDays(now, -5),
      updated_at: addDays(now, -1),
    },
    {
      title: 'Update project documentation',
      description: 'Refresh the README, API docs, and onboarding guide to reflect the latest endpoints and environment setup.',
      priority: 'medium',
      status: 'pending',
      due_date: addDays(now, 5),
      created_at: addDays(now, -3),
      updated_at: addDays(now, -3),
    },
    {
      title: 'Fix responsive layout on dashboard',
      description: '',
      priority: 'medium',
      status: 'pending',
      due_date: addDays(now, 2),
      created_at: addDays(now, -1),
      updated_at: addDays(now, -1),
    },
    {
      title: 'Research caching strategies',
      description: 'Compare Redis vs Memcached for session storage and query caching. Benchmark read/write latency and evaluate cluster support.',
      priority: 'low',
      status: 'completed',
      due_date: null,
      created_at: addDays(now, -7),
      updated_at: addDays(now, -3),
    },
  ];

  for (const todo of seedData) {
    db.run(
      `INSERT INTO todos (title, description, priority, status, due_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [todo.title, todo.description, todo.priority, todo.status, todo.due_date, todo.created_at, todo.updated_at]
    );

    const todoId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

    db.run(
      'INSERT INTO activity_log (todo_id, action, timestamp) VALUES (?, ?, ?)',
      [todoId, 'Created', todo.created_at]
    );

    if (todo.status === 'completed') {
      db.run(
        'INSERT INTO activity_log (todo_id, action, timestamp) VALUES (?, ?, ?)',
        [todoId, 'Completed', todo.updated_at]
      );
    }
  }

  saveDb();
}
