const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
const dbPath = path.join(dbDir, 'civiclens.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS districts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      risk_level TEXT NOT NULL CHECK(risk_level IN ('low', 'medium', 'high')),
      description TEXT,
      center_lat REAL NOT NULL,
      center_lng REAL NOT NULL,
      radius_m REAL NOT NULL,
      legal_framework TEXT
    );

    CREATE TABLE IF NOT EXISTS surveillance_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('cctv', 'facial_recognition', 'data_collection', 'safe_zone')),
      operator TEXT NOT NULL,
      retention_days INTEGER NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      district_id INTEGER,
      risk_level TEXT NOT NULL CHECK(risk_level IN ('low', 'medium', 'high')),
      description TEXT,
      FOREIGN KEY (district_id) REFERENCES districts(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_hash TEXT UNIQUE NOT NULL,
      incident_type TEXT NOT NULL,
      encrypted_payload TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

initSchema();

module.exports = db;
