const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const siteName = req.query.siteName ? String(req.query.siteName).replace(/[^a-z0-9_\u0E00-\u0E7F]/gi, '_') : 'img';
        const siteId = req.query.siteId || '0';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E3);
        const extension = path.extname(file.originalname) || '.jpg';
        cb(null, `${siteName}_${siteId}_${uniqueSuffix}${extension}`);
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
// Serve uploads statically
app.use('/api/pms/uploads', express.static('uploads'));

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
        const { name, status, color, equipment_types, work_type, filter_config, fields_schema } = req.body;
        const { rows } = await pool.query(
            `UPDATE projects 
       SET name = COALESCE($1, name),
           status = COALESCE($2, status),
           color = COALESCE($3, color),
           equipment_types = COALESCE($4, equipment_types),
           work_type = COALESCE($5, work_type),
           filter_config = COALESCE($7, filter_config),
           fields_schema = COALESCE($8, fields_schema)
       WHERE id = $6 RETURNING *`,
            [name, status, color, equipment_types ? JSON.stringify(equipment_types) : null, work_type, id,
                filter_config ? JSON.stringify(filter_config) : null,
                fields_schema ? JSON.stringify(fields_schema) : null]
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

// ─── PROJECT SITES MAPPING ───────────────────────────────────────────────────

app.get('/api/pms/project-sites', async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

        const { rows } = await pool.query(
            `SELECT site_id FROM project_sites WHERE project_id = $1`,
            [projectId]
        );
        res.json(rows.map(r => r.site_id));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/pms/project-sites', async (req, res) => {
    try {
        const { projectId, siteId } = req.body;
        await pool.query(
            `INSERT INTO project_sites (project_id, site_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [projectId, siteId]
        );
        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/pms/project-sites', async (req, res) => {
    try {
        const { projectId, siteId } = req.body;
        await pool.query(
            `DELETE FROM project_sites WHERE project_id = $1 AND site_id = $2`,
            [projectId, siteId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/pms/project-sites/bulk', async (req, res) => {
    try {
        const { projectId, siteIds } = req.body;
        if (!siteIds || siteIds.length === 0) return res.status(201).json({ success: true });

        await pool.query(
            `INSERT INTO project_sites (project_id, site_id)
             SELECT $1, unnest($2::int[])
             ON CONFLICT DO NOTHING`,
            [projectId, siteIds]
        );
        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/pms/project-sites/bulk', async (req, res) => {
    try {
        const { projectId, siteIds } = req.body;
        if (!siteIds || siteIds.length === 0) return res.json({ success: true });

        await pool.query(
            `DELETE FROM project_sites WHERE project_id = $1 AND site_id = ANY($2::int[])`,
            [projectId, siteIds]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ─── PROJECT SITE RECORDS (Per-Project/Per-Site Custom Data) ─────────────────

app.get('/api/pms/project-records', async (req, res) => {
    try {
        const { projectId, siteId } = req.query;
        if (!projectId) return res.status(400).json({ error: 'projectId required' });

        let query, params;
        if (siteId) {
            query = `SELECT * FROM project_site_records WHERE project_id = $1 AND site_id = $2`;
            params = [projectId, siteId];
        } else {
            query = `SELECT * FROM project_site_records WHERE project_id = $1`;
            params = [projectId];
        }
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/pms/project-records', async (req, res) => {
    try {
        const { projectId, siteId, customData, images } = req.body;
        if (!projectId || !siteId) return res.status(400).json({ error: 'projectId and siteId required' });

        const { rows } = await pool.query(
            `INSERT INTO project_site_records (project_id, site_id, custom_data, images, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (project_id, site_id)
             DO UPDATE SET
                custom_data = $3,
                images = $4,
                updated_at = NOW()
             RETURNING *`,
            [projectId, siteId, JSON.stringify(customData || {}), JSON.stringify(images || [])]
        );
        res.json(rows[0]);
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

// ─── MAP LAYERS (DYNAMIC MAPS) ────────────────────────────────────────────────

app.get('/api/pms/maps', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM map_layers ORDER BY created_at ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/pms/maps', async (req, res) => {
    try {
        const { name, schema } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO map_layers (name, schema) VALUES ($1, $2::jsonb) RETURNING *`,
            [name, JSON.stringify(schema || [])]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/pms/maps/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, schema } = req.body;
        const { rows } = await pool.query(
            `UPDATE map_layers SET name = COALESCE($1, name), schema = COALESCE($2::jsonb, schema) WHERE id = $3 RETURNING *`,
            [name, schema ? JSON.stringify(schema) : null, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Map not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/pms/maps/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Check if there are sites tied to this map
        const countRes = await pool.query('SELECT COUNT(*) FROM nt_sites WHERE map_id = $1', [id]);
        if (parseInt(countRes.rows[0].count) > 0) {
            return res.status(400).json({ error: 'Cannot delete map with existing locations' });
        }
        const { rowCount } = await pool.query('DELETE FROM map_layers WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Map not found' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ─── RECORDS (LOCATIONS/MAPS) ────────────────────────────────────────────────

app.get('/api/pms/nt-locations', async (req, res) => {
    try {
        const { mapId } = req.query;
        let query = `
            SELECT 
              s.id, s.site_name as locationname, s.latitude, s.longitude, 
              s.service_center as servicecenter, s.province, s.type, s.site_exists,
              s.map_id, s.custom_data,
              COUNT(l.id)::int as olt_count,
              COALESCE(
                  (SELECT json_agg(i.image_url) FROM nt_site_images i WHERE i.site_id = s.id),
                  '[]'::json
              ) as images
            FROM nt_sites s
            LEFT JOIN nt_locations l ON s.id = l.site_id
            WHERE 1=1
        `;
        const params = [];
        if (mapId) {
            params.push(mapId);
            query += ` AND s.map_id = $${params.length}`;
        }

        query += ` GROUP BY s.id ORDER BY s.id ASC`;

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/pms/nt-locations', async (req, res) => {
    try {
        const { type, locationname, province, servicecenter, latitude, longitude, image_url, images, site_exists, map_id, custom_data } = req.body;

        // Ensure map_id exists
        let targetMapId = map_id;
        if (!targetMapId) {
            const mapRes = await pool.query("SELECT id FROM map_layers WHERE name = 'NT Sites' LIMIT 1");
            if (mapRes.rows.length > 0) targetMapId = mapRes.rows[0].id;
        }

        let insertQuery = `
            INSERT INTO nt_sites (site_name, province, latitude, longitude, service_center, type, site_exists, map_id, custom_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb) RETURNING *
        `;
        const values = [
            locationname,
            province || '',
            latitude || 0,
            longitude || 0,
            servicecenter || '',
            type || 'ตู้สาขา',
            site_exists ?? true,
            targetMapId,
            JSON.stringify(custom_data || {})
        ];

        const { rows } = await pool.query(insertQuery, values);
        const newSite = rows[0];

        // Handle Images
        let imageArray = [];
        if (images && Array.isArray(images)) {
            imageArray = images;
        } else if (image_url) {
            imageArray = [image_url];
        }

        if (imageArray.length > 0) {
            for (const img of imageArray) {
                await pool.query('INSERT INTO nt_site_images (site_id, image_url) VALUES ($1, $2)', [newSite.id, img]);
            }
        }

        res.status(201).json(newSite);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/pms/nt-locations/advanced-bulk', async (req, res) => {
    const client = await pool.connect();
    try {
        const { mode, mapId, locations, deleteMissing } = req.body;
        if (!Array.isArray(locations) || !mapId) {
            return res.status(400).json({ error: 'Invalid payload: missing mapId or locations array' });
        }

        await client.query('BEGIN');
        const results = { inserted: 0, updated: 0, deleted: 0, skipped: 0 };
        const incomingSystemIds = [];

        const normalizeType = (t) => {
            if (!t) return 'ทั่วไป';
            const s = String(t).trim();
            const lower = s.toLowerCase();
            if (lower.includes('type a') || s === 'A') return 'A';
            if (lower.includes('type b') || s === 'B') return 'B';
            if (lower.includes('type c') || s === 'C') return 'C';
            if (lower.includes('type d') || s === 'D') return 'D';
            return s;
        };

        for (const loc of locations) {
            // Parse system_id as integer to match nt_sites.id column type (integer)
            let systemId = loc.system_id ? parseInt(loc.system_id, 10) : null;
            const type = normalizeType(loc.type);

            const values = [
                loc.locationname,
                loc.province || '',
                loc.latitude || 0,
                loc.longitude || 0,
                loc.servicecenter || '',
                type,
                loc.site_exists ?? true,
                mapId,
                JSON.stringify(loc.custom_data || {})
            ];

            if (mode === 'sync') {
                let existingId = null;

                // 1. Try matching by systemId if provided
                if (systemId && !isNaN(systemId)) {
                    const checkRes = await client.query('SELECT id FROM nt_sites WHERE id = $1::int AND map_id = $2::uuid', [systemId, mapId]);
                    if (checkRes.rows.length > 0) existingId = systemId;
                }

                // 2. Fallback: match by name and province
                if (!existingId) {
                    const matchRes = await client.query('SELECT id FROM nt_sites WHERE site_name = $1 AND province = $2 AND map_id = $3', [loc.locationname, loc.province || '', mapId]);
                    if (matchRes.rows.length > 0) {
                        existingId = matchRes.rows[0].id;
                        systemId = existingId;
                    }
                }

                if (existingId) {
                    incomingSystemIds.push(existingId);
                    await client.query(`
                        UPDATE nt_sites 
                        SET site_name=$1, province=$2, latitude=$3, longitude=$4, service_center=$5, type=$6, site_exists=$7, map_id=$8, custom_data=$9::jsonb
                        WHERE id=$10::int
                    `, [...values, existingId]);
                    results.updated++;
                } else {
                    const insertRes = await client.query(`
                        INSERT INTO nt_sites (site_name, province, latitude, longitude, service_center, type, site_exists, map_id, custom_data)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb) RETURNING id
                    `, values);
                    incomingSystemIds.push(insertRes.rows[0].id);
                    results.inserted++;
                }
            } else if (mode === 'append') {
                // Append Mode: Skip if name and province already exist in this map
                const checkRes = await client.query('SELECT id FROM nt_sites WHERE site_name = $1 AND province = $2 AND map_id = $3', [loc.locationname, loc.province || '', mapId]);
                if (checkRes.rows.length > 0) {
                    results.skipped++;
                } else {
                    await client.query(`
                        INSERT INTO nt_sites (site_name, province, latitude, longitude, service_center, type, site_exists, map_id, custom_data)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
                    `, values);
                    results.inserted++;
                }
            } else {
                // Otherwise Insert (Standard insert)
                await client.query(`
                    INSERT INTO nt_sites (site_name, province, latitude, longitude, service_center, type, site_exists, map_id, custom_data)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
                `, values);
                results.inserted++;
            }
        }

        // Handle Archiving/Deleting Missing Locations in Sync mode
        if (mode === 'sync' && deleteMissing) {
            // Find all IDs in this map that are NOT in the incoming batch
            let deleteQuery = 'SELECT id FROM nt_sites WHERE map_id = $1';
            let deleteParams = [mapId];

            if (incomingSystemIds.length > 0) {
                // Use ANY array parameter, explicitly comparing integer id with integer array
                deleteQuery += ' AND id != ALL($2::int[])';
                // Ensure all values are integers
                deleteParams.push(incomingSystemIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id)));
            }

            const missingRes = await client.query(deleteQuery, deleteParams);
            const missingIds = missingRes.rows.map(r => r.id);

            if (missingIds.length > 0) {
                // Archive to temporary table
                await client.query(`
                    INSERT INTO nt_sites_temp 
                    SELECT * FROM nt_sites WHERE id = ANY($1::int[])
                `, [missingIds]);

                // Delete from main table
                const delRes = await client.query(`
                    DELETE FROM nt_sites WHERE id = ANY($1::int[])
                `, [missingIds]);

                results.deleted = delRes.rowCount;
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Bulk operation successful', results });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Advanced Bulk insert error:', err);
        res.status(500).json({ error: 'Database error during advanced bulk operation', details: err.message });
    } finally {
        client.release();
    }
});

app.post('/api/pms/nt-locations/bulk', async (req, res) => {
    const client = await pool.connect();
    try {
        const locations = req.body;
        if (!Array.isArray(locations) || locations.length === 0) {
            return res.status(400).json({ error: 'Array of locations required' });
        }

        await client.query('BEGIN');
        const inserted = [];

        for (const loc of locations) {
            let targetMapId = loc.map_id;
            if (!targetMapId) {
                const mapRes = await client.query("SELECT id FROM map_layers WHERE name = 'NT Sites' LIMIT 1");
                if (mapRes.rows.length > 0) targetMapId = mapRes.rows[0].id;
            }

            const values = [
                loc.locationname,
                loc.province || '',
                loc.latitude || 0,
                loc.longitude || 0,
                loc.servicecenter || '',
                loc.type || 'ตู้สาขา',
                loc.site_exists ?? true,
                targetMapId,
                JSON.stringify(loc.custom_data || {})
            ];

            const { rows } = await client.query(`
                INSERT INTO nt_sites (site_name, province, latitude, longitude, service_center, type, site_exists, map_id, custom_data)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb) RETURNING *
            `, values);

            inserted.push(rows[0]);
        }

        await client.query('COMMIT');
        res.status(201).json(inserted);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Bulk insert error:', err);
        res.status(500).json({ error: 'Database error during bulk insert' });
    } finally {
        client.release();
    }
});

// Upload Endpoint
app.post('/api/pms/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Return relative path
        res.json({ url: `/api/pms/uploads/${req.file.filename}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.put('/api/pms/nt-locations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, locationname, province, servicecenter, latitude, longitude, image_url, images, site_exists, custom_data } = req.body;

        // Dynamic Update Query for nt_sites
        const { rows } = await pool.query(
            `UPDATE nt_sites 
             SET type = COALESCE($1, type),
                 site_name = COALESCE($2, site_name),
                 province = COALESCE($3, province),
                 service_center = COALESCE($4, service_center),
                 latitude = COALESCE($5, latitude),
                 longitude = COALESCE($6, longitude),
                 site_exists = COALESCE($7, site_exists),
                 custom_data = COALESCE($8::jsonb, custom_data)
             WHERE id = $9 RETURNING *`,
            [type, locationname, province, servicecenter, latitude, longitude, site_exists, custom_data ? JSON.stringify(custom_data) : null, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Location not found' });

        // Handle Images
        let imageArray = [];
        if (images && Array.isArray(images)) {
            imageArray = images;
        } else if (image_url) {
            imageArray = [image_url];
        }

        if (imageArray.length > 0 || Array.isArray(images)) {
            await pool.query('DELETE FROM nt_site_images WHERE site_id = $1', [id]);
            for (const img of imageArray) {
                await pool.query('INSERT INTO nt_site_images (site_id, image_url) VALUES ($1, $2)', [id, img]);
            }
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/pms/nt-locations/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');

        // Delete dependencies first
        await client.query('DELETE FROM nt_site_images WHERE site_id = $1', [id]);
        await client.query('DELETE FROM project_sites WHERE site_id = $1', [id]);

        // Remove mappings in nt_locations (we do not delete the OLTs, just remove their relation to this site)
        await client.query('UPDATE nt_locations SET site_id = NULL WHERE site_id = $1', [id]);

        // Delete the site itself
        const { rowCount } = await client.query('DELETE FROM nt_sites WHERE id = $1', [id]);

        await client.query('COMMIT');

        if (rowCount === 0) return res.status(404).json({ error: 'Location not found' });
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

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
