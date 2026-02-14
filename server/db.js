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

    CREATE TABLE IF NOT EXISTS pms_projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      color TEXT DEFAULT '#3b82f6',
      equipment_types TEXT DEFAULT '[]',
      work_type TEXT NOT NULL DEFAULT 'PM',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pms_locations (
      id TEXT PRIMARY KEY,
      province TEXT NOT NULL,
      site_name TEXT NOT NULL,
      num_facilities INTEGER DEFAULT 0,
      num_generators INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pms_records (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      work_type TEXT NOT NULL DEFAULT 'PM',
      site_id TEXT NOT NULL,
      equipment_type TEXT NOT NULL,
      date TEXT NOT NULL,
      inspector TEXT NOT NULL,
      co_inspector TEXT,
      status TEXT DEFAULT 'Pending',
      data TEXT DEFAULT '{}',
      notes TEXT,
      condition_rating INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES pms_projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pms_schedule_items (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      equipment_type TEXT NOT NULL,
      start_month INTEGER NOT NULL,
      duration INTEGER NOT NULL DEFAULT 1,
      label TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES pms_projects(id) ON DELETE CASCADE
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

  // Seed PMS projects (3 examples)
  const pmsProjectCount = db.prepare('SELECT COUNT(*) as count FROM pms_projects').get();
  if (pmsProjectCount.count === 0) {
    const seedProjects = [
      {
        id: 'proj-pm-1',
        name: 'โครงการบำรุงรักษาประจำปี 2568 (ภาคเหนือ)',
        status: 'active',
        color: '#3b82f6',
        equipment_types: JSON.stringify(['AC', 'Battery', 'Rectifier', 'Generator', 'Transformer']),
        work_type: 'PM',
      },
      {
        id: 'proj-pm-2',
        name: 'โครงการ PM ฉุกเฉินและซ่อมแซม Q1/2568',
        status: 'active',
        color: '#8b5cf6',
        equipment_types: JSON.stringify(['AC', 'Battery', 'Generator']),
        work_type: 'PM',
      },
      {
        id: 'proj-survey-1',
        name: 'โครงการสำรวจสภาพชุมสายภาคเหนือ 2568',
        status: 'active',
        color: '#10b981',
        equipment_types: JSON.stringify(['Infrastructure', 'Security', 'Environment', 'Power System']),
        work_type: 'Survey',
      },
    ];
    const pStmt = db.prepare('INSERT INTO pms_projects (id, name, status, color, equipment_types, work_type) VALUES (?, ?, ?, ?, ?, ?)');
    for (const p of seedProjects) pStmt.run(p.id, p.name, p.status, p.color, p.equipment_types, p.work_type);
  }

  // Seed PMS locations (3 examples)
  const pmsLocCount = db.prepare('SELECT COUNT(*) as count FROM pms_locations').get();
  if (pmsLocCount.count === 0) {
    const seedLocations = [
      { id: 'loc-1', province: 'เชียงใหม่', site_name: 'ศูนย์เชียงใหม่ 1',    num_facilities: 54, num_generators: 50 },
      { id: 'loc-2', province: 'เชียงราย',  site_name: 'ศูนย์เชียงราย 1',     num_facilities: 14, num_generators: 14 },
      { id: 'loc-3', province: 'ลำปาง',     site_name: 'ศูนย์ลำปาง 1',        num_facilities: 22, num_generators: 18 },
    ];
    const lStmt = db.prepare('INSERT INTO pms_locations (id, province, site_name, num_facilities, num_generators) VALUES (?, ?, ?, ?, ?)');
    for (const l of seedLocations) lStmt.run(l.id, l.province, l.site_name, l.num_facilities, l.num_generators);
  }

  // Seed PMS records (3 examples)
  const pmsRecCount = db.prepare('SELECT COUNT(*) as count FROM pms_records').get();
  if (pmsRecCount.count === 0) {
    const seedRecords = [
      {
        id: 'rec-1',
        project_id: 'proj-pm-1', work_type: 'PM',
        site_id: 'loc-1', equipment_type: 'AC',
        date: '2025-03-10', inspector: 'สมชาย มั่นใจ', co_inspector: null,
        status: 'Normal', data: '{}',
        notes: 'PM1 ล้างคอยล์เรียบร้อย น้ำยาปกติ', condition_rating: null,
      },
      {
        id: 'rec-2',
        project_id: 'proj-pm-1', work_type: 'PM',
        site_id: 'loc-2', equipment_type: 'Battery',
        date: '2025-04-05', inspector: 'วิชัย สมาน', co_inspector: 'ประสิทธิ์ ดีงาม',
        status: 'Abnormal', data: '{}',
        notes: 'พบ Cell เสื่อมสภาพ 3 ลูก แรงดันต่ำกว่าเกณฑ์ ต้องเปลี่ยน', condition_rating: null,
      },
      {
        id: 'rec-3',
        project_id: 'proj-survey-1', work_type: 'Survey',
        site_id: 'loc-3', equipment_type: 'Infrastructure',
        date: '2025-02-20', inspector: 'เก่งกาจ สำรวจดี', co_inspector: 'สมหญิง รักดี',
        status: 'Normal', data: '{}',
        notes: 'โครงสร้างอาคารอยู่ในสภาพดี ไม่พบรอยร้าวหรือการทรุดตัว', condition_rating: 5,
      },
    ];
    const rStmt = db.prepare('INSERT INTO pms_records (id, project_id, work_type, site_id, equipment_type, date, inspector, co_inspector, status, data, notes, condition_rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const r of seedRecords) rStmt.run(r.id, r.project_id, r.work_type, r.site_id, r.equipment_type, r.date, r.inspector, r.co_inspector, r.status, r.data, r.notes, r.condition_rating);
  }

  // Seed PMS schedule items (3 examples)
  const pmsSchCount = db.prepare('SELECT COUNT(*) as count FROM pms_schedule_items').get();
  if (pmsSchCount.count === 0) {
    const seedSchedule = [
      { id: 'sch-1', project_id: 'proj-pm-1', equipment_type: 'AC',        start_month: 3, duration: 2, label: 'PM เครื่องปรับอากาศ (ล้างคอยล์)' },
      { id: 'sch-2', project_id: 'proj-pm-1', equipment_type: 'Battery',   start_month: 5, duration: 2, label: 'PM แบตเตอรี่ (Capacity Test)' },
      { id: 'sch-3', project_id: 'proj-pm-1', equipment_type: 'Generator', start_month: 8, duration: 3, label: 'PM เครื่องกำเนิดไฟฟ้า (Annual Service)' },
    ];
    const sStmt = db.prepare('INSERT INTO pms_schedule_items (id, project_id, equipment_type, start_month, duration, label) VALUES (?, ?, ?, ?, ?, ?)');
    for (const s of seedSchedule) sStmt.run(s.id, s.project_id, s.equipment_type, s.start_month, s.duration, s.label);
  }
}

module.exports = { getDB, initDB, SEED_APPS };
