'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'nexus.db');
let db = null;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

const SEED_APPS = [
  { id: 'rd-processor',  name: 'RD Smart Processor',  description: 'เครื่องมือจัดการข้อมูลมิเตอร์อัจฉริยะ RD03/RD05', icon: 'Data',    color: 'text-cyan-400',    path: '/app1',  app_type: 'iframe',   iframe_src: '/app1/', display_order: 0 },
  { id: 'ems-transform', name: 'EMS แปลงค่าไฟฟ้า',   description: 'แปลงข้อมูลค่าไฟฟ้าจาก Excel เป็น CSV', icon: 'Cloud',  color: 'text-yellow-400',  path: '/app2', app_type: 'iframe',   iframe_src: '/app2/', display_order: 1 },
  { id: 'file-merger',   name: 'Excel & CSV Merger',  description: 'รวม Excel/CSV หลายไฟล์เข้าเป็นหนึ่ง',                                 icon: 'Stack',   color: 'text-orange-400',  path: '/app3',   app_type: 'iframe',   iframe_src: '/app3/', display_order: 2 },
];

function initDB() {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT 'Dev',
      color TEXT DEFAULT 'text-zinc-100',
      path TEXT NOT NULL,
      app_type TEXT DEFAULT 'internal',
      iframe_src TEXT,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed admin user if not exists
  const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
  }

  // Seed default apps if table is empty
  const appCount = db.prepare('SELECT COUNT(*) as count FROM apps').get();
  if (appCount.count === 0) {
    const stmt = db.prepare(
      'INSERT INTO apps (id, name, description, icon, color, path, app_type, iframe_src, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const app of SEED_APPS) {
      stmt.run(app.id, app.name, app.description, app.icon, app.color, app.path, app.app_type, app.iframe_src, app.display_order);
    }
  }
}

module.exports = { getDB, initDB, SEED_APPS };
