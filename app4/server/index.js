const express = require('express');
const cors = require('cors');
const db = require('./db');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Prevent caching for all API routes
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Initialize DB schema
const initDb = async () => {
    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        // Split schema by semicolon to handle multiple statements if any (though typical sqlite exec can handle it, better safe)
        // db.query in db.js uses db.all, which might not be best for DDL like CREATE TABLE. 
        // Let's us db.run for schema.
        const db = require('./db');
        // Simple hack: We can just use the db.run exposed, but schema might have multiple statements
        // For simple schema.sql with one CREATE TABLE, it should work.
        // But better:
        const sqlite3 = require('sqlite3').verbose();
        const dbPath = path.resolve(__dirname, 'database.sqlite');
        const rawDb = new sqlite3.Database(dbPath);

        rawDb.exec(schema, (err) => {
            if (err) console.error('Error initializing DB schema:', err);
            else {
                console.log('Database schema initialized');
                // Check and add columns for locking mechanism if they don't exist
                rawDb.all("PRAGMA table_info(projects)", (err, rows) => {
                    if (err) {
                        console.error("Error checking table info:", err);
                        return;
                    }
                    const columns = rows.map(r => r.name);
                    if (!columns.includes('locked_by')) {
                        rawDb.run("ALTER TABLE projects ADD COLUMN locked_by TEXT", (err) => {
                            if (!err) console.log("Added locked_by column");
                        });
                    }
                    if (!columns.includes('last_active_at')) {
                        rawDb.run("ALTER TABLE projects ADD COLUMN last_active_at DATETIME", (err) => {
                            if (!err) console.log("Added last_active_at column");
                        });
                    }
                });
            }
        });
    } catch (err) {
        console.error('Error reading/initializing DB:', err);
    }
}

// Routes
const apiRouter = express.Router();
// Routes on apiRouter
apiRouter.get('/materials', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM materials ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post('/materials', async (req, res) => {
    const { material_type, material_code, material_name, category, unit, unit_price, cable_unit_price, labor_unit_price, action_type, spec_brand, remark, symbol_group } = req.body;
    try {
        const result = await db.run(
            `INSERT INTO materials (material_type, material_code, material_name, category, unit, unit_price, cable_unit_price, labor_unit_price, action_type, spec_brand, remark, symbol_group)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [material_type, material_code, material_name, category, unit, unit_price, cable_unit_price, labor_unit_price, action_type, spec_brand, remark, symbol_group]
        );
        const inserted = await db.get('SELECT * FROM materials WHERE id = ?', [result.lastID]);
        res.status(201).json(inserted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.put('/materials/:id', async (req, res) => {
    const { id } = req.params;
    const { material_type, material_code, material_name, category, unit, unit_price, cable_unit_price, labor_unit_price, action_type, spec_brand, remark, symbol_group } = req.body;
    try {
        const result = await db.run(
            `UPDATE materials SET material_type=?, material_code=?, material_name=?, category=?, unit=?, unit_price=?, cable_unit_price=?, labor_unit_price=?, action_type=?, spec_brand=?, remark=?, symbol_group=?
             WHERE id=?`,
            [material_type, material_code, material_name, category, unit, unit_price, cable_unit_price, labor_unit_price, action_type, spec_brand, remark, symbol_group, id]
        );
        if (result.changes === 0) return res.status(404).json({ error: 'Material not found' });

        const updated = await db.get('SELECT * FROM materials WHERE id = ?', [id]);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.delete('/materials/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.run('DELETE FROM materials WHERE id=?', [id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Material not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post('/materials/seed', async (req, res) => {
    const materials = req.body;
    if (!Array.isArray(materials)) return res.status(400).json({ error: 'Expected array' });

    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, 'database.sqlite');
    const rawDb = new sqlite3.Database(dbPath);

    rawDb.serialize(() => {
        rawDb.run('BEGIN TRANSACTION');
        rawDb.run('DELETE FROM materials');
        rawDb.run('DELETE FROM sqlite_sequence WHERE name="materials"');

        const stmt = rawDb.prepare(`INSERT INTO materials (material_type, material_code, material_name, category, unit, unit_price, cable_unit_price, labor_unit_price, action_type, spec_brand, remark, symbol_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        for (const m of materials) {
            stmt.run(m.material_type, m.material_code, m.material_name, m.category, m.unit, m.unit_price, m.cable_unit_price, m.labor_unit_price, m.action_type, m.spec_brand, m.remark, m.symbol_group);
        }

        stmt.finalize();
        rawDb.run('COMMIT', (err) => {
            if (err) {
                rawDb.run('ROLLBACK');
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: `Seeded ${materials.length} items` });
            }
        });
    });
});

// Icons API
apiRouter.get('/icons', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM custom_icons ORDER BY sort_order ASC, id ASC');
        const icons = rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            dots: JSON.parse(row.dots || '[]'),
            dataUrl: row.data_url,
            associatedCategory: row.associated_category,
            isSystem: row.is_system === 1,
            iconGroup: row.icon_group,
            sortOrder: row.sort_order || 0,
            allowSubMaterials: row.allow_sub_materials === 1
        }));
        res.json(icons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post('/icons', async (req, res) => {
    const { id, name, description, dots, dataUrl, associatedCategory, isSystem, iconGroup, sortOrder, allowSubMaterials } = req.body;
    try {
        await db.run(
            `INSERT INTO custom_icons (id, name, description, dots, data_url, associated_category, is_system, icon_group, sort_order, allow_sub_materials)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, description, JSON.stringify(dots), dataUrl, associatedCategory, isSystem ? 1 : 0, iconGroup || null, sortOrder || 0, allowSubMaterials ? 1 : 0]
        );
        res.status(201).json({ message: 'Icon saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.put('/icons/:id', async (req, res) => {
    const { id } = req.params;

    // Accept both camelCase (iconGroup) and snake_case (icon_group) from frontend
    const { name, description, dots, dataUrl, data_url, associatedCategory, associated_category, isSystem, is_system, iconGroup, icon_group, sortOrder, sort_order, allowSubMaterials } = req.body;

    // Prefer snake_case (what frontend sends) over camelCase (what GET returns)
    const finalDataUrl = data_url ?? dataUrl;
    const finalCategory = associated_category ?? associatedCategory;
    const finalIsSystem = is_system ?? isSystem;
    const finalIconGroup = icon_group ?? iconGroup;
    const finalSortOrder = sort_order ?? sortOrder;
    const finalAllowSub = req.body.allow_sub_materials ?? allowSubMaterials;

    try {
        const result = await db.run(
            `UPDATE custom_icons SET name=?, description=?, dots=?, data_url=?, associated_category=?, is_system=?, icon_group=?, sort_order=?, allow_sub_materials=?
             WHERE id=?`,
            [name, description, JSON.stringify(dots || []), finalDataUrl, finalCategory, finalIsSystem ? 1 : 0, finalIconGroup || null, finalSortOrder !== undefined ? finalSortOrder : 0, finalAllowSub ? 1 : 0, id]
        );
        if (result.changes === 0) return res.status(404).json({ error: 'Icon not found' });
        res.json({ message: 'Icon updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.delete('/icons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.run('DELETE FROM custom_icons WHERE id=?', [id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Icon not found' });
        res.json({ message: 'Icon deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Batch update for drag-and-drop reordering
apiRouter.put('/icons/batch/reorder', async (req, res) => {
    const { updates } = req.body; // Array of { id, iconGroup, sortOrder }
    if (!Array.isArray(updates)) {
        return res.status(400).json({ error: 'Expected updates array' });
    }

    try {
        // Use transaction for atomic updates
        const sqlite3 = require('sqlite3').verbose();
        const dbPath = path.resolve(__dirname, 'database.sqlite');
        const rawDb = new sqlite3.Database(dbPath);

        await new Promise((resolve, reject) => {
            rawDb.serialize(() => {
                rawDb.run('BEGIN TRANSACTION', (err) => {
                    if (err) return reject(err);
                });

                const stmt = rawDb.prepare('UPDATE custom_icons SET icon_group = ?, sort_order = ? WHERE id = ?');
                for (const update of updates) {
                    stmt.run(update.iconGroup || null, update.sortOrder !== undefined ? update.sortOrder : 0, update.id);
                }
                stmt.finalize();

                rawDb.run('COMMIT', (err) => {
                    if (err) {
                        rawDb.run('ROLLBACK');
                        rawDb.close();
                        return reject(err);
                    }
                    rawDb.close();
                    resolve();
                });
            });
        });

        res.json({ message: `Updated ${updates.length} icons` });
    } catch (err) {
        console.error('Batch update error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Projects API
apiRouter.get('/projects', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
        const now = Date.now();
        const projects = result.rows.map(p => {
            // Check if lock is valid (active within last 45 seconds)
            const lastActive = p.last_active_at ? new Date(p.last_active_at).getTime() : 0;
            const isLocked = p.locked_by && (now - lastActive < 45000);

            return {
                ...p,
                state: JSON.parse(p.state),
                createdAt: p.created_at,
                budgetYear: p.budget_year,
                workType: p.work_type,
                lockedBy: isLocked ? p.locked_by : null, // Only return lockedBy if lock is valid
                lastActiveAt: p.last_active_at
            };
        });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post('/projects/:id/heartbeat', async (req, res) => {
    const { id } = req.params;
    const { clientId } = req.body;
    try {
        await db.run(
            `UPDATE projects SET last_active_at = DATETIME('now'), locked_by = ? WHERE id = ?`,
            [clientId, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post('/projects/:id/lock', async (req, res) => {
    const { id } = req.params;
    const { clientId } = req.body;
    try {
        const project = await db.get('SELECT locked_by, last_active_at FROM projects WHERE id = ?', [id]);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const now = Date.now();
        const lastActive = project.last_active_at ? new Date(project.last_active_at).getTime() : 0;
        const isLocked = project.locked_by && project.locked_by !== clientId && (now - lastActive < 45000);

        if (isLocked) {
            return res.status(409).json({ error: 'Project is locked', lockedBy: project.locked_by });
        }

        // Acquire lock
        await db.run(
            `UPDATE projects SET locked_by = ?, last_active_at = DATETIME('now') WHERE id = ?`,
            [clientId, id]
        );
        res.json({ success: true, message: 'Lock acquired' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post('/projects/:id/release', async (req, res) => {
    const { id } = req.params;
    const { clientId } = req.body;
    try {
        await db.run(
            `UPDATE projects SET locked_by = NULL WHERE id = ? AND locked_by = ?`,
            [id, clientId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post('/projects', async (req, res) => {
    const { id, name, description, createdAt, state, province, budgetYear, area, workType } = req.body;
    try {
        await db.run(
            `INSERT INTO projects (id, name, description, created_at, state, province, budget_year, area, work_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, description, createdAt, JSON.stringify(state), province, budgetYear, area, workType]
        );
        res.status(201).json({ message: 'Project saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.put('/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, state, province, budgetYear, area, workType, clientId, force } = req.body;

    // Optimistic locking check
    if (!force) {
        const current = await db.get('SELECT locked_by, last_active_at FROM projects WHERE id = ?', [id]);
        if (current) {
            const now = Date.now();
            const lastActive = current.last_active_at ? new Date(current.last_active_at).getTime() : 0;
            const isLocked = current.locked_by && current.locked_by !== clientId && (now - lastActive < 45000);
            if (isLocked) {
                return res.status(409).json({ error: 'Project is locked by another user', lockedBy: current.locked_by });
            }
        }
    }

    try {
        const result = await db.run(
            `UPDATE projects SET name=?, description=?, state=?, province=?, budget_year=?, area=?, work_type=?, last_active_at=DATETIME('now')
             WHERE id=?`,
            [name, description, JSON.stringify(state), province, budgetYear, area, workType, id]
        );
        if (result.changes === 0) return res.status(404).json({ error: 'Project not found' });
        res.json({ message: 'Project updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.delete('/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.run('DELETE FROM projects WHERE id=?', [id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Project not found' });
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

apiRouter.post('/projects/seed', async (req, res) => {
    const projects = req.body;
    if (!Array.isArray(projects)) return res.status(400).json({ error: 'Expected array' });

    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, 'database.sqlite');
    const rawDb = new sqlite3.Database(dbPath);

    rawDb.serialize(() => {
        rawDb.run('BEGIN TRANSACTION');
        rawDb.run('DELETE FROM projects');

        const stmt = rawDb.prepare(`INSERT INTO projects (id, name, description, created_at, state, province, budget_year, area, work_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        for (const p of projects) {
            stmt.run(p.id, p.name, p.description, p.createdAt, JSON.stringify(p.state), p.province, p.budgetYear, p.area, p.workType);
        }

        stmt.finalize();
        rawDb.run('COMMIT', (err) => {
            if (err) {
                rawDb.run('ROLLBACK');
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: `Seeded ${projects.length} projects` });
            }
        });
    });
});

// Mount router
app.use('/api', apiRouter);
app.use('/app4/api', apiRouter);

// Serve static files
app.use('/app4', express.static(path.join(__dirname, '../dist')));

// Handle client-side routing - return index.html for all non-API routes under /app4
app.get(/^\/app4\/.*$/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Root redirect (optional, if user hits root asking for app4)
app.get('/', (req, res) => {
    res.redirect('/app4/');
});

initDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
});


