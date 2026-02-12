'use strict';

const express = require('express');
const router = express.Router();
const { getDB, SEED_APPS } = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET /api/apps
router.get('/', verifyToken, (req, res) => {
  const db = getDB();
  const apps = db.prepare('SELECT * FROM apps ORDER BY display_order ASC').all();
  res.json({ apps });
});

// POST /api/apps/reset  (must be before /:id to avoid param collision)
router.post('/reset', verifyToken, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM apps').run();

  const stmt = db.prepare(
    'INSERT INTO apps (id, name, description, icon, color, path, app_type, iframe_src, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const app of SEED_APPS) {
    stmt.run(app.id, app.name, app.description, app.icon, app.color, app.path, app.app_type, app.iframe_src, app.display_order);
  }

  const apps = db.prepare('SELECT * FROM apps ORDER BY display_order ASC').all();
  res.json({ apps });
});

// POST /api/apps
router.post('/', verifyToken, (req, res) => {
  const db = getDB();
  const { id, name, description, icon, color, path, app_type, iframe_src } = req.body;

  if (!id || !name || !path) {
    return res.status(400).json({ error: 'id, name, and path are required' });
  }

  const existing = db.prepare('SELECT id FROM apps WHERE id = ?').get(id);
  if (existing) {
    return res.status(409).json({ error: 'App with this ID already exists' });
  }

  const maxOrder = db.prepare('SELECT COALESCE(MAX(display_order), -1) as max FROM apps').get();
  db.prepare(`
    INSERT INTO apps (id, name, description, icon, color, path, app_type, iframe_src, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, description || '', icon || 'Dev', color || 'text-zinc-100', path, app_type || 'internal', iframe_src || null, maxOrder.max + 1);

  const app = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);
  res.status(201).json({ app });
});

// PUT /api/apps/:id
router.put('/:id', verifyToken, (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const updates = req.body;

  const existing = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'App not found' });
  }

  const fields = ['name', 'description', 'icon', 'color', 'path', 'app_type', 'iframe_src'];
  const setClauses = [];
  const values = [];

  for (const field of fields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }

  if (setClauses.length > 0) {
    values.push(id);
    db.prepare(`UPDATE apps SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
  }

  const app = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);
  res.json({ app });
});

// DELETE /api/apps/:id
router.delete('/:id', verifyToken, (req, res) => {
  const db = getDB();
  const { id } = req.params;

  const existing = db.prepare('SELECT id FROM apps WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'App not found' });
  }

  db.prepare('DELETE FROM apps WHERE id = ?').run(id);
  res.json({ success: true });
});

module.exports = router;
