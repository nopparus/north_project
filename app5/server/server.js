const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── PROJECTS ────────────────────────────────────────────────────────────────

app.get('/api/pms/projects', async (req, res) => {
    try {
        const { workType } = req.query;
        let query = 'SELECT * FROM projects';
        const params = [];
        if (workType) {
            query += ' WHERE work_type = $1';
            params.push(workType);
        }
        query += ' ORDER BY created_at DESC';
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/pms/projects', async (req, res) => {
    try {
        const { name, status, color, equipment_types, work_type } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO projects (name, status, color, equipment_types, work_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, status, color, JSON.stringify(equipment_types), work_type]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/pms/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status, color, equipment_types, work_type } = req.body;
        const { rows } = await pool.query(
            `UPDATE projects 
       SET name = COALESCE($1, name),
           status = COALESCE($2, status),
           color = COALESCE($3, color),
           equipment_types = COALESCE($4, equipment_types),
           work_type = COALESCE($5, work_type)
       WHERE id = $6 RETURNING *`,
            [name, status, color, equipment_types ? JSON.stringify(equipment_types) : null, work_type, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/pms/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Project not found' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ─── LOCATIONS ───────────────────────────────────────────────────────────────

app.get('/api/pms/locations', async (req, res) => {
    try {
        const { province } = req.query;
        let query = 'SELECT * FROM locations';
        const params = [];
        if (province) {
            query += ' WHERE province = $1';
            params.push(province);
        }
        query += ' ORDER BY site_name ASC';
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/pms/locations', async (req, res) => {
    try {
        const { province, site_name, num_facilities, num_generators } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO locations (province, site_name, num_facilities, num_generators)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [province, site_name, num_facilities, num_generators]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/pms/locations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { province, site_name, num_facilities, num_generators } = req.body;
        const { rows } = await pool.query(
            `UPDATE locations 
       SET province = COALESCE($1, province),
           site_name = COALESCE($2, site_name),
           num_facilities = COALESCE($3, num_facilities),
           num_generators = COALESCE($4, num_generators)
       WHERE id = $5 RETURNING *`,
            [province, site_name, num_facilities, num_generators, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Location not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/pms/locations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM locations WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Location not found' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ─── RECORDS ─────────────────────────────────────────────────────────────────

app.get('/api/pms/records', async (req, res) => {
    try {
        const { projectId, workType } = req.query;
        let query = 'SELECT * FROM maintenance_records';
        const params = [];
        const conditions = [];

        if (projectId) {
            params.push(projectId);
            conditions.push(`project_id = $${params.length}`);
        }
        if (workType) {
            params.push(workType);
            conditions.push(`work_type = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY date DESC';
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/pms/records', async (req, res) => {
    try {
        const { project_id, work_type, site_id, equipment_type, date, inspector, co_inspector, status, data, notes, condition_rating } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO maintenance_records (project_id, work_type, site_id, equipment_type, date, inspector, co_inspector, status, data, notes, condition_rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [project_id, work_type, site_id, equipment_type, date, inspector, co_inspector, status, JSON.stringify(data), notes, condition_rating]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/pms/records/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { project_id, work_type, site_id, equipment_type, date, inspector, co_inspector, status, data, notes, condition_rating } = req.body;
        const { rows } = await pool.query(
            `UPDATE maintenance_records
       SET project_id = COALESCE($1, project_id),
           work_type = COALESCE($2, work_type),
           site_id = COALESCE($3, site_id),
           equipment_type = COALESCE($4, equipment_type),
           date = COALESCE($5, date),
           inspector = COALESCE($6, inspector),
           co_inspector = COALESCE($7, co_inspector),
           status = COALESCE($8, status),
           data = COALESCE($9, data),
           notes = COALESCE($10, notes),
           condition_rating = COALESCE($11, condition_rating)
       WHERE id = $12 RETURNING *`,
            [project_id, work_type, site_id, equipment_type, date, inspector, co_inspector, status, data ? JSON.stringify(data) : null, notes, condition_rating, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/pms/records/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM maintenance_records WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Record not found' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ─── SCHEDULE ────────────────────────────────────────────────────────────────

app.get('/api/pms/schedule', async (req, res) => {
    try {
        const { projectId } = req.query;
        let query = 'SELECT * FROM schedule_items';
        const params = [];
        if (projectId) {
            query += ' WHERE project_id = $1';
            params.push(projectId);
        }
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/pms/schedule', async (req, res) => {
    try {
        const { project_id, equipment_type, start_month, duration, label } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO schedule_items (project_id, equipment_type, start_month, duration, label)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [project_id, equipment_type, start_month, duration, label]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/pms/schedule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { project_id, equipment_type, start_month, duration, label } = req.body;
        const { rows } = await pool.query(
            `UPDATE schedule_items 
       SET project_id = COALESCE($1, project_id),
           equipment_type = COALESCE($2, equipment_type),
           start_month = COALESCE($3, start_month),
           duration = COALESCE($4, duration),
           label = COALESCE($5, label)
       WHERE id = $6 RETURNING *`,
            [project_id, equipment_type, start_month, duration, label, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Schedule item not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/pms/schedule/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM schedule_items WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Schedule item not found' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
