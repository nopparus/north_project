'use strict';

const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
// No authentication required for now, or use verifyToken if needed.
// Given the current architecture, verifyToken might require a valid session.
// For simplicity and matching App6's style if it were public, but let's be safe.
const { verifyToken } = require('../middleware/auth');

// GET /api/app1/configs
router.get('/configs', (req, res) => {
    try {
        const db = getDB();
        const rows = db.prepare('SELECT key, value FROM app1_configs').all();
        const configs = {};
        rows.forEach(row => {
            try {
                configs[row.key] = JSON.parse(row.value);
            } catch (e) {
                configs[row.key] = row.value;
            }
        });
        res.json(configs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/app1/configs
router.post('/configs', (req, res) => {
    try {
        const db = getDB();
        const { key, value } = req.body;

        if (!key) {
            return res.status(400).json({ error: 'Key is required' });
        }

        const jsonValue = JSON.stringify(value);

        db.prepare(`
      INSERT INTO app1_configs (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `).run(key, jsonValue);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
