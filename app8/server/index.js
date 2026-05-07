const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const XLSX = require('xlsx');
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}
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

const ONU_COLUMN_MAP = {
    'วันที่ปิดงานติดตั้ง': 'installation_close_date',
    'รหัสใบคำขอ': 'request_id',
    'หมายเลขวงจร': 'circuit_id',
    'จังหวัด(ติดตั้ง)': 'province',
    'บริการหลัก': 'main_service',
    'ความเร็ว': 'speed',
    'ราคา (บาท/เดือน)': 'price',
    'servicesname': 'service_name',
    'วันที่เริ่มโปรโมชัน': 'promotion_start_date',
    'ส่วน': 'section',
    'exchange': 'ชุมสาย',
    'ยี่ห้อ CPE : รุ่น': 'cpe_brand_model',
    'ยี่ห้อ OLT : รุ่น': 'olt_brand_model',
    'สถานะอุปกรณ์ปลายทาง (CPE)': 'cpe_status',
    'สถานะบริการ': 'service_status'
};

function formatExcelDate(val) {
    if (!val) return null;
    let date;
    if (val instanceof Date) {
        date = val;
    } else if (typeof val === 'number') {
        date = new Date((val - 25569) * 86400 * 1000);
    } else {
        date = new Date(val);
    }
    if (isNaN(date.getTime())) return val;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
}

app.post('/api/onu/upload', authenticate, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('TRUNCATE onu_records_backup');
        await client.query('INSERT INTO onu_records_backup SELECT * FROM onu_records');
        await client.query('TRUNCATE onu_records');
        
        const workbook = XLSX.readFile(req.file.path, { cellDates: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        
        const fields = Object.values(ONU_COLUMN_MAP);
        const BATCH_SIZE = 500;
        
        for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
            const batch = rawData.slice(i, i + BATCH_SIZE);
            const placeholders = [];
            const values = [];
            
            batch.forEach((row, rowIndex) => {
                const rowPlaceholders = [];
                fields.forEach((field, fieldIndex) => {
                    const thaiHeader = Object.keys(ONU_COLUMN_MAP).find(k => ONU_COLUMN_MAP[k] === field);
                    let val = row[thaiHeader];
                    if (val === 'NULL' || val === '') val = null;
                    if (val !== null && field.includes('date')) val = formatExcelDate(val);
                    if (val !== null && field === 'price' && typeof val === 'string') val = val.replace(/,/g, '');
                    
                    rowPlaceholders.push(`$${rowIndex * fields.length + fieldIndex + 1}`);
                    values.push(val);
                });
                placeholders.push(`(${rowPlaceholders.join(', ')})`);
            });
            
            const insertQuery = `INSERT INTO onu_records (${fields.join(', ')}) VALUES ${placeholders.join(', ')}`;
            await client.query(insertQuery, values);
        }
        
        await client.query('COMMIT');
        await logActivity(req.user.id, 'UPLOAD', 'onu_records', 0, { rows: rawData.length });
        res.json({ message: 'Upload successful', rows: rawData.length });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Upload failed' });
    } finally {
        client.release();
        fs.unlinkSync(req.file.path);
    }
});

app.post('/api/onu/restore', authenticate, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const countRes = await client.query('SELECT COUNT(*) FROM onu_records_backup');
        if (parseInt(countRes.rows[0].count) === 0) throw new Error('No backup data found');
        await client.query('TRUNCATE onu_records');
        await client.query('INSERT INTO onu_records SELECT * FROM onu_records_backup');
        await client.query('COMMIT');
        await logActivity(req.user.id, 'RESTORE', 'onu_records', 0, { message: 'Restored from backup' });
        res.json({ message: 'Restore successful' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

app.get('/api/onu/backup-status', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM onu_records_backup');
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) { res.status(500).json({ message: 'Error checking backup status' }); }
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

// WiFi Device Mappings
app.get('/api/wifi-mappings/groups', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const countResult = await pool.query(`
            SELECT COUNT(DISTINCT (brand, model)) as total 
            FROM wifi_routers 
            WHERE brand IS NOT NULL AND model IS NOT NULL
        `);
        const total = parseInt(countResult.rows[0].total);

        const result = await pool.query(`
            WITH raw_groups AS (
                SELECT DISTINCT brand as raw_brand, model as raw_model
                FROM wifi_routers 
                WHERE brand IS NOT NULL AND model IS NOT NULL
            ),
            joined AS (
                SELECT g.raw_brand, g.raw_model, m.target_brand, m.target_model, m.id as mapped_id
                FROM raw_groups g
                LEFT JOIN wifi_mappings m ON g.raw_brand = m.raw_brand AND g.raw_model = m.raw_model
            )
            SELECT * FROM joined
            ORDER BY raw_brand ASC, raw_model ASC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        res.json({ data: result.rows, total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/wifi-mappings', authenticate, async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    const { raw_brand, raw_model, target_brand, target_model } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO wifi_mappings (raw_brand, raw_model, target_brand, target_model)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (raw_brand, raw_model) 
            DO UPDATE SET target_brand = EXCLUDED.target_brand, target_model = EXCLUDED.target_model
            RETURNING *
        `, [raw_brand, raw_model, target_brand, target_model]);
        await logActivity(req.user.id, 'WIFI_MAPPING_UPDATE', 'wifi_mappings', result.rows[0].id, req.body);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/wifi-mappings/new-discoveries', authenticate, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT brand as raw_brand, model as raw_model
            FROM wifi_routers 
            WHERE brand IS NOT NULL AND model IS NOT NULL
            AND (brand, model) NOT IN (SELECT raw_brand, raw_model FROM wifi_mappings)
        `);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/wifi-mappings/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM wifi_mappings WHERE id = $1', [id]);
        await logActivity(req.user.id, 'DELETE_WIFI_MAPPING', 'wifi_mappings', id, { id });
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

// Reports - Integrated Data// WiFi Routers
const WIFI_COLUMN_MAP = {
    'หมายเลขวงจร': 'circuit_id',
    'ยี่ห้อ': 'brand',
    'รุ่น': 'model',
    'version': 'version'
};

app.get('/api/wifi-routers', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortField = req.query.sortField || 'id';
    const sortOrder = req.query.sortOrder || 'DESC';
    const offset = (page - 1) * limit;

    try {
        let whereClause = '';
        const params = [];
        if (search) {
            whereClause = 'WHERE circuit_id ILIKE $1 OR brand ILIKE $1 OR model ILIKE $1';
            params.push(`%${search}%`);
        }

        const validSortFields = ['id', 'circuit_id', 'brand', 'model', 'version'];
        const finalSort = validSortFields.includes(sortField) ? sortField : 'id';

        const countRes = await pool.query(`SELECT COUNT(*) FROM wifi_routers ${whereClause}`, params);
        const dataRes = await pool.query(`
            SELECT * FROM wifi_routers 
            ${whereClause} 
            ORDER BY ${finalSort} ${sortOrder} 
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, limit, offset]);

        res.json({ data: dataRes.rows, total: parseInt(countRes.rows[0].count) });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/wifi-routers/upload', authenticate, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('TRUNCATE wifi_routers_backup');
        await client.query('INSERT INTO wifi_routers_backup SELECT * FROM wifi_routers');
        await client.query('TRUNCATE wifi_routers');
        
        const workbook = XLSX.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        
        const fields = Object.values(WIFI_COLUMN_MAP);
        const BATCH_SIZE = 500;
        
        for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
            const batch = rawData.slice(i, i + BATCH_SIZE);
            const placeholders = [];
            const values = [];
            
            batch.forEach((row, rowIndex) => {
                const rowPlaceholders = [];
                fields.forEach((field, fieldIndex) => {
                    const thaiHeader = Object.keys(WIFI_COLUMN_MAP).find(k => WIFI_COLUMN_MAP[k] === field);
                    const val = row[thaiHeader] || null;
                    rowPlaceholders.push(`$${rowIndex * fields.length + fieldIndex + 1}`);
                    values.push(val);
                });
                placeholders.push(`(${rowPlaceholders.join(', ')})`);
            });
            
            const insertQuery = `INSERT INTO wifi_routers (${fields.join(', ')}) VALUES ${placeholders.join(', ')}`;
            await client.query(insertQuery, values);
        }
        
        // Sync to Device Catalog
        await client.query(`
            INSERT INTO device_catalog (brand, model, onu_type)
            SELECT DISTINCT brand, model, 'WiFi Router' 
            FROM wifi_routers 
            WHERE brand IS NOT NULL AND model IS NOT NULL
            ON CONFLICT (brand, model) DO UPDATE SET onu_type = EXCLUDED.onu_type
        `);
        
        await client.query('COMMIT');
        await logActivity(req.user.id, 'UPLOAD', 'wifi_routers', 0, { rows: rawData.length });
        res.json({ message: 'Upload successful', rows: rawData.length });
    } catch (err) {
        console.error('WiFi Upload Error:', err);
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Upload failed: ' + err.message });
    } finally {
        client.release();
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
});

app.post('/api/wifi-routers/restore', authenticate, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const countRes = await client.query('SELECT COUNT(*) FROM wifi_routers_backup');
        if (parseInt(countRes.rows[0].count) === 0) throw new Error('No backup data found');
        await client.query('TRUNCATE wifi_routers');
        await client.query('INSERT INTO wifi_routers SELECT * FROM wifi_routers_backup');

        // Sync to Device Catalog
        await client.query(`
            INSERT INTO device_catalog (brand, model, onu_type)
            SELECT DISTINCT brand, model, 'WiFi Router' 
            FROM wifi_routers 
            WHERE brand IS NOT NULL AND model IS NOT NULL
            ON CONFLICT (brand, model) DO UPDATE SET onu_type = EXCLUDED.onu_type
        `);

        await client.query('COMMIT');
        res.json({ message: 'Restore successful' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

app.get('/api/wifi-routers/backup-status', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM wifi_routers_backup');
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

// Integrated Report
app.get('/api/reports/integrated-data', authenticate, async (req, res) => {
    const { search, page = 1, limit = 50, sortField = 'id', sortOrder = 'DESC' } = req.query;
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
                OR w.brand ILIKE $1
                OR w.model ILIKE $1
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
                c.grade,
                w.brand as wifi_brand,
                w.model as wifi_model,
                w.version as wifi_version,
                wm.target_brand as wifi_mapped_brand,
                wm.target_model as wifi_mapped_model,
                wc.onu_type as wifi_hw_type,
                wc.lan_ge as wifi_lan_ge,
                wc.lan_fe as wifi_lan_fe,
                wc.wifi as wifi_wifi_spec
            FROM onu_records o
            LEFT JOIN cpe_devices d ON o.cpe_brand_model = d.raw_name
            LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
            LEFT JOIN wifi_routers w ON o.circuit_id = w.circuit_id
            LEFT JOIN wifi_mappings wm ON w.brand = wm.raw_brand AND w.model = wm.raw_model
            LEFT JOIN device_catalog wc ON wm.target_brand = wc.brand AND wm.target_model = wc.model
            ${whereClause}
            ORDER BY o.${sortField} ${sortOrder}
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*) 
            FROM onu_records o
            LEFT JOIN cpe_devices d ON o.cpe_brand_model = d.raw_name
            LEFT JOIN wifi_routers w ON o.circuit_id = w.circuit_id
            ${whereClause}
        `;

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, [...params, parseInt(limit), offset]),
            pool.query(countQuery, params)
        ]);
        res.json({ data: dataResult.rows, total: parseInt(countResult.rows[0].count) });
    } catch (err) {
        console.error('Report Error:', err);
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
    'grade': 'Grade',
    'wifi_brand': 'WiFi Router: ยี่ห้อ (ดิบ)',
    'wifi_model': 'WiFi Router: รุ่น (ดิบ)',
    'wifi_version': 'WiFi Router: Version (ดิบ)',
    'wifi_mapped_brand': 'WiFi Router: ยี่ห้อ (มาตรฐาน)',
    'wifi_mapped_model': 'WiFi Router: รุ่น (มาตรฐาน)',
    'wifi_hw_type': 'WiFi Router: Hardware Type',
    'wifi_lan_ge': 'WiFi Router: LAN GE',
    'wifi_lan_fe': 'WiFi Router: LAN FE',
    'wifi_wifi_spec': 'WiFi Router: WiFi Spec'
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
                OR w.brand ILIKE $1
                OR w.model ILIKE $1
            `;
            params.push(searchPattern);
        }

        const queryText = `
            SELECT 
                o.*, d.brand as mapped_brand, d.model as mapped_model,
                c.onu_type, c.version, c.lan_ge, c.lan_fe, c.wifi, c.usage, c.grade,
                w.brand as wifi_brand, w.model as wifi_model, w.version as wifi_version,
                wm.target_brand as wifi_mapped_brand, wm.target_model as wifi_mapped_model,
                wc.onu_type as wifi_hw_type, wc.lan_ge as wifi_lan_ge, wc.lan_fe as wifi_lan_fe, wc.wifi as wifi_wifi_spec
            FROM onu_records o
            LEFT JOIN cpe_devices d ON o.cpe_brand_model = d.raw_name
            LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
            LEFT JOIN wifi_routers w ON o.circuit_id = w.circuit_id
            LEFT JOIN wifi_mappings wm ON w.brand = wm.raw_brand AND w.model = wm.raw_model
            LEFT JOIN device_catalog wc ON wm.target_brand = wc.brand AND wm.target_model = wc.model
            ${whereClause}
            ORDER BY o.id DESC
        `;

        const client = await pool.connect();
        const query = new QueryStream(queryText, params);
        const stream = client.query(query);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=integrated_report_${new Date().toISOString().split('T')[0]}.xlsx`);
        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res, useStyles: false, useSharedStrings: false });
        const worksheet = workbook.addWorksheet('Integrated Report');
        const selectedKeys = columns ? columns.split(',') : Object.keys(ALL_REPORT_COLUMNS);
        worksheet.columns = selectedKeys.filter(key => ALL_REPORT_COLUMNS[key]).map(key => ({ header: ALL_REPORT_COLUMNS[key], key }));
        stream.on('data', (row) => worksheet.addRow(row).commit());
        stream.on('end', async () => { await workbook.commit(); client.release(); });
        stream.on('error', (err) => { client.release(); res.end(); });
    } catch (err) { res.status(500).json({ message: 'Export failed' }); }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
