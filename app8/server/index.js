const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3008;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not defined in environment variables!');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE ---

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const logActivity = async (userId, action, table, targetId, details) => {
    try {
        await pool.query(
            'INSERT INTO activity_logs (user_id, action, target_table, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [userId, action, table, targetId, JSON.stringify(details)]
        );
    } catch (err) {
        console.error('Logging failed:', err);
    }
};

// --- ROUTES ---

// Auth
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user || !await bcrypt.compare(password, user.password_hash)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        console.error('Auth check error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/auth/me', authenticate, (req, res) => {
    res.json(req.user);
});

// ONU Records (Server-side Pagination & Sort)
app.get('/api/onu', authenticate, async (req, res) => {
    const { 
        search, 
        page = 1, 
        limit = 50, 
        sortField = 'id', 
        sortOrder = 'DESC' 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const validSortFields = [
        'id', 'installation_close_date', 'request_id', 'circuit_id', 'province', 
        'main_service', 'speed', 'price', 'service_name', 'promotion_start_date', 
        'section', 'exchange', 'cpe_brand_model', 'olt_brand_model', 'cpe_status', 
        'service_status', 'created_at'
    ];
    const finalSortField = validSortFields.includes(sortField) ? sortField : 'id';
    const finalSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    try {
        let query = 'SELECT * FROM onu_records';
        let countQuery = 'SELECT COUNT(*) FROM onu_records';
        const params = [];

        if (search) {
            const searchPattern = `%${search}%`;
            const searchFields = [
                'request_id', 'circuit_id', 'province', 'main_service', 'speed',
                'service_name', 'section', 'exchange', 'cpe_brand_model', 
                'olt_brand_model', 'cpe_status', 'service_status'
            ];
            const whereClause = searchFields.map(f => `${f} ILIKE $1`).join(' OR ');
            query += ` WHERE ${whereClause}`;
            countQuery += ` WHERE ${whereClause}`;
            params.push(searchPattern);
        }

        query += ` ORDER BY ${finalSortField} ${finalSortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        const finalParams = [...params, parseInt(limit), offset];

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, finalParams),
            pool.query(countQuery, params)
        ]);

        res.json({
            data: dataResult.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error('Fetch ONU error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const ALLOWED_ONU_FIELDS = [
    'installation_close_date', 'request_id', 'circuit_id', 'province', 
    'main_service', 'speed', 'price', 'service_name', 'promotion_start_date', 
    'section', 'exchange', 'cpe_brand_model', 'olt_brand_model', 'cpe_status', 
    'service_status'
];

app.post('/api/onu', authenticate, async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    
    // Whitelist check to prevent SQL injection
    const fields = Object.keys(req.body).filter(k => ALLOWED_ONU_FIELDS.includes(k));
    if (fields.length === 0) return res.status(400).json({ message: 'No valid fields provided' });

    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO onu_records (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const values = fields.map(f => req.body[f]);

    try {
        const result = await pool.query(query, values);
        await logActivity(req.user.id, 'CREATE', 'onu_records', result.rows[0].id, req.body);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create ONU error:', err);
        res.status(500).json({ message: 'Failed to create record' });
    }
});

app.put('/api/onu/:id', authenticate, async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    
    const { id } = req.params;
    // Whitelist check to prevent SQL injection
    const fields = Object.keys(req.body).filter(k => ALLOWED_ONU_FIELDS.includes(k));
    if (fields.length === 0) return res.status(400).json({ message: 'No valid fields provided' });

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const query = `UPDATE onu_records SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`;
    const values = [...fields.map(f => req.body[f]), id];

    try {
        const result = await pool.query(query, values);
        await logActivity(req.user.id, 'UPDATE', 'onu_records', id, req.body);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update ONU error:', err);
        res.status(500).json({ message: 'Failed to update record' });
    }
});

app.delete('/api/onu/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
    
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM onu_records WHERE id = $1', [id]);
        await logActivity(req.user.id, 'DELETE', 'onu_records', id, { id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Logs
app.get('/api/logs', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const countResult = await pool.query('SELECT COUNT(*) FROM activity_logs');
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query(`
            SELECT l.*, u.username 
            FROM activity_logs l 
            JOIN users u ON l.user_id = u.id 
            ORDER BY l.created_at DESC 
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        res.json({ data: result.rows, total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CPE Management
app.get('/api/cpe-groups', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query.sortField || 'raw_name';
    const sortOrder = req.query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

    // Only allow sorting on safe columns
    const validSortFields = ['raw_name', 'brand', 'model'];
    const finalSort = validSortFields.includes(sortField) ? sortField : 'raw_name';

    try {
        const countResult = await pool.query(`
            SELECT COUNT(DISTINCT cpe_brand_model) as total 
            FROM onu_records 
            WHERE cpe_brand_model IS NOT NULL AND cpe_brand_model != ''
        `);
        const total = parseInt(countResult.rows[0].total);

        const result = await pool.query(`
            WITH raw_groups AS (
                SELECT DISTINCT cpe_brand_model as raw_name 
                FROM onu_records 
                WHERE cpe_brand_model IS NOT NULL AND cpe_brand_model != ''
            ),
            joined AS (
                SELECT g.raw_name, d.brand, d.model, d.id as mapped_id
                FROM raw_groups g
                LEFT JOIN cpe_devices d ON g.raw_name = d.raw_name
            )
            SELECT * FROM joined
            ORDER BY ${finalSort} ${sortOrder} NULLS LAST
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        res.json({ data: result.rows, total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/cpe-groups/new-discoveries', authenticate, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT cpe_brand_model as raw_name 
            FROM onu_records 
            WHERE cpe_brand_model IS NOT NULL AND cpe_brand_model != ''
            AND cpe_brand_model NOT IN (SELECT raw_name FROM cpe_devices)
        `);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/cpe-devices/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM cpe_devices WHERE id = $1', [id]);
        await logActivity(req.user.id, 'DELETE_MAPPING', 'cpe_devices', id, { id });
        res.json({ message: 'Mapping deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Device Catalog - All (for autocomplete, no pagination)
app.get('/api/device-catalog/all', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, brand, model, onu_type, version, lan_ge, lan_fe, wifi, usage, grade FROM device_catalog ORDER BY brand ASC, model ASC');
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Device Catalog (paginated)
app.get('/api/device-catalog', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query.sortField || 'brand';
    const sortOrder = req.query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const validSortFields = ['brand', 'model', 'onu_type', 'version', 'lan_ge', 'lan_fe', 'wifi', 'usage', 'grade'];
    const finalSort = validSortFields.includes(sortField) ? sortField : 'brand';

    try {
        const countResult = await pool.query('SELECT COUNT(*) FROM device_catalog');
        const total = parseInt(countResult.rows[0].count);
        
        const result = await pool.query(`SELECT * FROM device_catalog ORDER BY ${finalSort} ${sortOrder} LIMIT $1 OFFSET $2`, [limit, offset]);
        res.json({ data: result.rows, total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/device-catalog', authenticate, async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    const { brand, model, onu_type, version, lan_ge, lan_fe, wifi, usage, grade } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO device_catalog (brand, model, onu_type, version, lan_ge, lan_fe, wifi, usage, grade, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
            ON CONFLICT (brand, model) 
            DO UPDATE SET 
                onu_type = EXCLUDED.onu_type,
                version  = EXCLUDED.version,
                lan_ge   = EXCLUDED.lan_ge,
                lan_fe   = EXCLUDED.lan_fe,
                wifi     = EXCLUDED.wifi,
                usage    = EXCLUDED.usage,
                grade    = EXCLUDED.grade,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [brand, model, onu_type, version, lan_ge, lan_fe, wifi, usage, grade]);
        
        await logActivity(req.user.id, 'CATALOG_UPDATE', 'device_catalog', result.rows[0].id, req.body);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/device-catalog/:id', authenticate, async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM device_catalog WHERE id = $1', [id]);
        await logActivity(req.user.id, 'CATALOG_DELETE', 'device_catalog', id, { id });
        res.json({ message: 'Device specification deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/cpe-devices', authenticate, async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    const { raw_name, brand, model } = req.body;
    try {
        // Ensure brand/model exists in catalog (upsert without overwriting specs)
        await pool.query(`
            INSERT INTO device_catalog (brand, model, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (brand, model) DO NOTHING
        `, [brand, model]);

        const result = await pool.query(`
            INSERT INTO cpe_devices (raw_name, brand, model, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (raw_name) 
            DO UPDATE SET 
                brand = EXCLUDED.brand, 
                model = EXCLUDED.model, 
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [raw_name, brand, model]);
        
        await logActivity(req.user.id, 'MAP_CPE', 'cpe_devices', result.rows[0].id, req.body);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reports - Integrated Data
app.get('/api/reports/integrated-data', authenticate, async (req, res) => {
    const { 
        search, 
        page = 1, 
        limit = 50, 
        sortField = 'id', 
        sortOrder = 'DESC' 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    try {
        let whereClause = '';
        const params = [];

        if (search) {
            const searchPattern = `%${search}%`;
            whereClause = `
                WHERE o.request_id ILIKE $1 
                OR o.circuit_id ILIKE $1 
                OR o.cpe_brand_model ILIKE $1
                OR d.brand ILIKE $1
                OR d.model ILIKE $1
            `;
            params.push(searchPattern);
        }

        const query = `
            SELECT 
                o.*,
                d.brand as mapped_brand,
                d.model as mapped_model,
                c.onu_type,
                c.version,
                c.lan_ge,
                c.lan_fe,
                c.wifi,
                c.usage,
                c.grade
            FROM onu_records o
            LEFT JOIN cpe_devices d ON o.cpe_brand_model = d.raw_name
            LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
            ${whereClause}
            ORDER BY o.${sortField} ${sortOrder}
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*) 
            FROM onu_records o
            LEFT JOIN cpe_devices d ON o.cpe_brand_model = d.raw_name
            ${whereClause}
        `;

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, [...params, parseInt(limit), offset]),
            pool.query(countQuery, params)
        ]);

        res.json({
            data: dataResult.rows,
            total: parseInt(countResult.rows[0].count)
        });
    } catch (err) {
        console.error('Report error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const ALL_REPORT_COLUMNS = {
    'installation_close_date': 'วันที่ปิดงานติดตั้ง',
    'request_id': 'รหัสใบคำขอ',
    'circuit_id': 'หมายเลขวงจร',
    'province': 'จังหวัด(ติดตั้ง)',
    'main_service': 'บริการหลัก',
    'speed': 'ความเร็ว',
    'price': 'ราคา (บาท/เดือน)',
    'service_name': 'servicesname',
    'promotion_start_date': 'วันที่เริ่มโปรโมชัน',
    'section': 'ส่วน',
    'exchange': 'ชุมสาย',
    'cpe_brand_model': 'ยี่ห้อ CPE : รุ่น',
    'olt_brand_model': 'ยี่ห้อ OLT : รุ่น',
    'cpe_status': 'สถานะอุปกรณ์ปลายทาง (CPE)',
    'service_status': 'สถานะบริการ',
    'mapped_brand': 'ยี่ห้อ (จับคู่แล้ว)',
    'mapped_model': 'รุ่น (จับคู่แล้ว)',
    'onu_type': 'Hardware Type',
    'version': 'Version',
    'lan_ge': 'LAN GE',
    'lan_fe': 'LAN FE',
    'wifi': 'WiFi',
    'usage': 'Usage',
    'grade': 'Grade'
};

app.get('/api/reports/export-excel', authenticate, async (req, res) => {
    const { search, columns } = req.query;
    const QueryStream = require('pg-query-stream');
    const ExcelJS = require('exceljs');

    try {
        let whereClause = '';
        const params = [];
        if (search) {
            const searchPattern = `%${search}%`;
            whereClause = `
                WHERE o.request_id ILIKE $1 
                OR o.circuit_id ILIKE $1 
                OR o.cpe_brand_model ILIKE $1
                OR d.brand ILIKE $1
                OR d.model ILIKE $1
            `;
            params.push(searchPattern);
        }

        const queryText = `
            SELECT 
                o.installation_close_date, o.request_id, o.circuit_id, o.province, 
                o.main_service, o.speed, o.price, o.service_name, o.promotion_start_date, 
                o.section, o.exchange, o.cpe_brand_model, o.olt_brand_model, o.cpe_status, 
                o.service_status,
                d.brand as mapped_brand,
                d.model as mapped_model,
                c.onu_type,
                c.version,
                c.lan_ge,
                c.lan_fe,
                c.wifi,
                c.usage,
                c.grade
            FROM onu_records o
            LEFT JOIN cpe_devices d ON o.cpe_brand_model = d.raw_name
            LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
            ${whereClause}
            ORDER BY o.id DESC
        `;

        const client = await pool.connect();
        const query = new QueryStream(queryText, params);
        const stream = client.query(query);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=integrated_report_${new Date().toISOString().split('T')[0]}.xlsx`);

        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
            stream: res,
            useStyles: false,
            useSharedStrings: false
        });

        const worksheet = workbook.addWorksheet('Integrated Report');
        
        // Dynamic column selection
        const selectedKeys = columns ? columns.split(',') : Object.keys(ALL_REPORT_COLUMNS);
        worksheet.columns = selectedKeys
            .filter(key => ALL_REPORT_COLUMNS[key])
            .map(key => ({ 
                header: ALL_REPORT_COLUMNS[key], 
                key 
            }));

        stream.on('data', (row) => {
            worksheet.addRow(row).commit();
        });

        stream.on('end', async () => {
            await workbook.commit();
            client.release();
        });

        stream.on('error', (err) => {
            console.error('Stream error:', err);
            client.release();
            res.end();
        });

    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ message: 'Export failed' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
