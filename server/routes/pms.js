'use strict';

const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { v4: uuidv4 } = require('uuid');

// ─── PROJECTS ────────────────────────────────────────────────────────────────

router.get('/projects', (req, res) => {
  try {
    const db = getDB();
    const { workType } = req.query;
    let rows;
    if (workType) {
      rows = db.prepare('SELECT * FROM pms_projects WHERE work_type = ? ORDER BY created_at ASC').all(workType);
    } else {
      rows = db.prepare('SELECT * FROM pms_projects ORDER BY created_at ASC').all();
    }
    const projects = rows.map(r => ({ ...r, equipment_types: JSON.parse(r.equipment_types || '[]') }));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/projects', (req, res) => {
  try {
    const db = getDB();
    const { name, status = 'active', color = '#3b82f6', equipment_types = [], work_type = 'PM' } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const id = 'proj-' + uuidv4().slice(0, 8);
    db.prepare('INSERT INTO pms_projects (id, name, status, color, equipment_types, work_type) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, name, status, color, JSON.stringify(equipment_types), work_type);
    const row = db.prepare('SELECT * FROM pms_projects WHERE id = ?').get(id);
    res.status(201).json({ ...row, equipment_types: JSON.parse(row.equipment_types) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/projects/:id', (req, res) => {
  try {
    const db = getDB();
    const { name, status, color, equipment_types, work_type } = req.body;
    const existing = db.prepare('SELECT * FROM pms_projects WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    db.prepare(`UPDATE pms_projects SET
      name = ?, status = ?, color = ?, equipment_types = ?, work_type = ?
      WHERE id = ?`).run(
      name ?? existing.name,
      status ?? existing.status,
      color ?? existing.color,
      equipment_types !== undefined ? JSON.stringify(equipment_types) : existing.equipment_types,
      work_type ?? existing.work_type,
      req.params.id
    );
    const row = db.prepare('SELECT * FROM pms_projects WHERE id = ?').get(req.params.id);
    res.json({ ...row, equipment_types: JSON.parse(row.equipment_types) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/projects/:id', (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM pms_projects WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LOCATIONS ───────────────────────────────────────────────────────────────

router.get('/locations', (req, res) => {
  try {
    const db = getDB();
    const { province } = req.query;
    let rows;
    if (province) {
      rows = db.prepare('SELECT * FROM pms_locations WHERE province = ? ORDER BY site_name ASC').all(province);
    } else {
      rows = db.prepare('SELECT * FROM pms_locations ORDER BY province ASC, site_name ASC').all();
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/locations', (req, res) => {
  try {
    const db = getDB();
    const { province, site_name, num_facilities = 0, num_generators = 0 } = req.body;
    if (!province || !site_name) return res.status(400).json({ error: 'province and site_name are required' });
    const id = 'loc-' + uuidv4().slice(0, 8);
    db.prepare('INSERT INTO pms_locations (id, province, site_name, num_facilities, num_generators) VALUES (?, ?, ?, ?, ?)')
      .run(id, province, site_name, num_facilities, num_generators);
    const row = db.prepare('SELECT * FROM pms_locations WHERE id = ?').get(id);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/locations/:id', (req, res) => {
  try {
    const db = getDB();
    const { province, site_name, num_facilities, num_generators } = req.body;
    const existing = db.prepare('SELECT * FROM pms_locations WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Location not found' });
    db.prepare(`UPDATE pms_locations SET province = ?, site_name = ?, num_facilities = ?, num_generators = ? WHERE id = ?`)
      .run(
        province ?? existing.province,
        site_name ?? existing.site_name,
        num_facilities ?? existing.num_facilities,
        num_generators ?? existing.num_generators,
        req.params.id
      );
    const row = db.prepare('SELECT * FROM pms_locations WHERE id = ?').get(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/locations/:id', (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM pms_locations WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Location not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── RECORDS ─────────────────────────────────────────────────────────────────

router.get('/records', (req, res) => {
  try {
    const db = getDB();
    const { projectId, workType } = req.query;
    let sql = 'SELECT * FROM pms_records WHERE 1=1';
    const params = [];
    if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
    if (workType)  { sql += ' AND work_type = ?';  params.push(workType); }
    sql += ' ORDER BY date DESC, created_at DESC';
    const rows = db.prepare(sql).all(...params);
    const records = rows.map(r => ({ ...r, data: JSON.parse(r.data || '{}') }));
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/records', (req, res) => {
  try {
    const db = getDB();
    const { project_id, work_type = 'PM', site_id, equipment_type, date, inspector, co_inspector, status = 'Pending', data = {}, notes, condition_rating } = req.body;
    if (!project_id || !site_id || !equipment_type || !date || !inspector) {
      return res.status(400).json({ error: 'project_id, site_id, equipment_type, date, inspector are required' });
    }
    const id = 'rec-' + uuidv4().slice(0, 8);
    db.prepare(`INSERT INTO pms_records
      (id, project_id, work_type, site_id, equipment_type, date, inspector, co_inspector, status, data, notes, condition_rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, project_id, work_type, site_id, equipment_type, date, inspector, co_inspector || null, status, JSON.stringify(data), notes || null, condition_rating || null);
    const row = db.prepare('SELECT * FROM pms_records WHERE id = ?').get(id);
    res.status(201).json({ ...row, data: JSON.parse(row.data) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/records/:id', (req, res) => {
  try {
    const db = getDB();
    const existing = db.prepare('SELECT * FROM pms_records WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    const { project_id, work_type, site_id, equipment_type, date, inspector, co_inspector, status, data, notes, condition_rating } = req.body;
    db.prepare(`UPDATE pms_records SET
      project_id = ?, work_type = ?, site_id = ?, equipment_type = ?, date = ?,
      inspector = ?, co_inspector = ?, status = ?, data = ?, notes = ?, condition_rating = ?
      WHERE id = ?`).run(
      project_id ?? existing.project_id,
      work_type ?? existing.work_type,
      site_id ?? existing.site_id,
      equipment_type ?? existing.equipment_type,
      date ?? existing.date,
      inspector ?? existing.inspector,
      co_inspector !== undefined ? co_inspector : existing.co_inspector,
      status ?? existing.status,
      data !== undefined ? JSON.stringify(data) : existing.data,
      notes !== undefined ? notes : existing.notes,
      condition_rating !== undefined ? condition_rating : existing.condition_rating,
      req.params.id
    );
    const row = db.prepare('SELECT * FROM pms_records WHERE id = ?').get(req.params.id);
    res.json({ ...row, data: JSON.parse(row.data) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/records/:id', (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM pms_records WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SCHEDULE ITEMS ───────────────────────────────────────────────────────────

router.get('/schedule', (req, res) => {
  try {
    const db = getDB();
    const { projectId } = req.query;
    let rows;
    if (projectId) {
      rows = db.prepare('SELECT * FROM pms_schedule_items WHERE project_id = ? ORDER BY start_month ASC').all(projectId);
    } else {
      rows = db.prepare('SELECT * FROM pms_schedule_items ORDER BY project_id ASC, start_month ASC').all();
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/schedule', (req, res) => {
  try {
    const db = getDB();
    const { project_id, equipment_type, start_month, duration = 1, label } = req.body;
    if (!project_id || !equipment_type || start_month === undefined || !label) {
      return res.status(400).json({ error: 'project_id, equipment_type, start_month, label are required' });
    }
    const id = 'sch-' + uuidv4().slice(0, 8);
    db.prepare('INSERT INTO pms_schedule_items (id, project_id, equipment_type, start_month, duration, label) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, project_id, equipment_type, start_month, duration, label);
    const row = db.prepare('SELECT * FROM pms_schedule_items WHERE id = ?').get(id);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/schedule/:id', (req, res) => {
  try {
    const db = getDB();
    const existing = db.prepare('SELECT * FROM pms_schedule_items WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Schedule item not found' });
    const { project_id, equipment_type, start_month, duration, label } = req.body;
    db.prepare(`UPDATE pms_schedule_items SET project_id = ?, equipment_type = ?, start_month = ?, duration = ?, label = ? WHERE id = ?`)
      .run(
        project_id ?? existing.project_id,
        equipment_type ?? existing.equipment_type,
        start_month ?? existing.start_month,
        duration ?? existing.duration,
        label ?? existing.label,
        req.params.id
      );
    const row = db.prepare('SELECT * FROM pms_schedule_items WHERE id = ?').get(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/schedule/:id', (req, res) => {
  try {
    const db = getDB();
    const result = db.prepare('DELETE FROM pms_schedule_items WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Schedule item not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
