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

// Get all wages
router.get('/wages', (req, res) => {
    try {
        const db = getDB();
        const wagesList = db.prepare('SELECT province, wage FROM app6_minimum_wages').all();
        // Return as key-value pair for easy usage frontend side { 'กรุงเทพมหานคร': 363, ... }
        const wagesObj = {};
        for (const item of wagesList) {
            wagesObj[item.province] = item.wage;
        }
        res.json(wagesObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update single province wage
router.post('/wages', (req, res) => {
    const { province, wage } = req.body;
    try {
        const db = getDB();
        const stmt = db.prepare(`
            INSERT INTO app6_minimum_wages (province, wage, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(province) DO UPDATE SET 
                wage = excluded.wage, 
                updated_at = CURRENT_TIMESTAMP
        `);
        stmt.run(province, wage);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk sync (import)
router.post('/wages/sync', (req, res) => {
    const wagesArray = req.body; // Expects an object like: { 'กรุงเทพ': 363, 'ภูเก็ต': 370 }
    if (!wagesArray || typeof wagesArray !== 'object') {
        return res.status(400).json({ error: 'Invalid payload format' });
    }

    try {
        const db = getDB();
        const stmt = db.prepare(`
            INSERT INTO app6_minimum_wages (province, wage, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(province) DO UPDATE SET 
                wage = excluded.wage, 
                updated_at = CURRENT_TIMESTAMP
        `);

        const transaction = db.transaction((wages) => {
            for (const [province, wage] of Object.entries(wages)) {
                if (province && !isNaN(Number(wage))) {
                    stmt.run(province, Number(wage));
                }
            }
        });

        transaction(wagesArray);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
