'use strict';

const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

// Get all profiles
router.get('/profiles', (req, res) => {
    try {
        const db = getDB();
        const profiles = db.prepare('SELECT * FROM app6_shift_profiles ORDER BY name ASC').all();
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create or Update profile
router.post('/profiles', (req, res) => {
    const { id, name, normalHours, otHours, holidayNormalHours, holidayOtHours, shiftsPerPointNormal, shiftsPerPointHoliday } = req.body;
    try {
        const db = getDB();
        const stmt = db.prepare(`
      INSERT INTO app6_shift_profiles 
      (id, name, normalHours, otHours, holidayNormalHours, holidayOtHours, shiftsPerPointNormal, shiftsPerPointHoliday)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        normalHours = excluded.normalHours,
        otHours = excluded.otHours,
        holidayNormalHours = excluded.holidayNormalHours,
        holidayOtHours = excluded.holidayOtHours,
        shiftsPerPointNormal = excluded.shiftsPerPointNormal,
        shiftsPerPointHoliday = excluded.shiftsPerPointHoliday
    `);
        stmt.run(id, name, normalHours, otHours, holidayNormalHours, holidayOtHours, shiftsPerPointNormal, shiftsPerPointHoliday);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete profile
router.delete('/profiles/:id', (req, res) => {
    const { id } = req.params;
    try {
        const db = getDB();
        db.prepare('DELETE FROM app6_shift_profiles WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk sync (initial migration)
router.post('/profiles/sync', (req, res) => {
    const profiles = req.body; // Array of profiles
    try {
        const db = getDB();
        const insert = db.prepare(`
      INSERT INTO app6_shift_profiles 
      (id, name, normalHours, otHours, holidayNormalHours, holidayOtHours, shiftsPerPointNormal, shiftsPerPointHoliday)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `);

        const transaction = db.transaction((profs) => {
            for (const p of profs) {
                insert.run(
                    p.id,
                    p.name,
                    p.normalHours,
                    p.otHours,
                    p.holidayNormalHours,
                    p.holidayOtHours,
                    p.shiftsPerPointNormal,
                    p.shiftsPerPointHoliday
                );
            }
        });

        transaction(profiles);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
