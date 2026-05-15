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

// Helper to refresh materialized view asynchronously
const refreshCircuitView = () => {
    pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_circuit_summary')
        .then(() => console.log('Materialized view refreshed successfully'))
        .catch(err => console.error('Failed to refresh materialized view:', err));
};

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

// ONU Get OLT (Special view)
app.get('/api/onu-get-olt', authenticate, async (req, res) => {
    const { search, page = 1, limit = 50, sortField = 'id', sortOrder = 'ASC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Validate sortField
    const validSortFields = ['id', 'created_at', 'onu_actual_type', 'brand', 'province', 'project', 'onutype', 'service', 'service_group', 'start_date_css', 'mapped_brand', 'mapped_model'];
    const finalSortField = validSortFields.includes(sortField) ? sortField : 'id';
    const finalSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    try {
        let query = `
            SELECT o.*, d.brand as mapped_brand, d.model as mapped_model 
            FROM onu_get_olt o
            LEFT JOIN cpe_devices d ON o.onu_actual_type = d.raw_name
        `;
        let countQuery = 'SELECT COUNT(*) FROM onu_get_olt o';
        const params = [];

        if (search) {
            const searchPattern = `%${search}%`;
            // Search in most common columns (IP, Name, Port, Brand, Province, Model)
            const searchFields = ['onu_actual_type', 'brand', 'province', 'project', 'onutype', 'service', 'service_group', 'start_date_css']; 
            const whereClause = searchFields.map(f => `o.${f} ILIKE $1`).join(' OR ');
            query += ` WHERE ${whereClause}`;
            countQuery += ` WHERE ${whereClause}`;
            params.push(searchPattern);
        }

        const sortFieldPrefix = ['id', 'brand', 'created_at'].includes(finalSortField) ? 'o.' : '';
        query += ` ORDER BY ${sortFieldPrefix}${finalSortField} ${finalSortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        const finalParams = [...params, parseInt(limit), offset];

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, finalParams),
            pool.query(countQuery, params)
        ]);

console.log("ONU Get OLT row sample:", dataResult.rows[0]);
        res.json({
            data: dataResult.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error('Fetch ONU Get OLT error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/onu-get-olt', authenticate, async (req, res) => {
    const data = req.body;
    const fields = ['onu_actual_type', 'brand', 'province', 'project', 'onutype', 'service', 'service_group', 'start_date_css'];
    
    try {
        const columns = fields.filter(f => data[f] !== undefined);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const values = columns.map(f => data[f]);
        
        const query = `INSERT INTO onu_get_olt (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create ONU Get OLT error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/onu-get-olt/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const fields = ['onu_actual_type', 'brand', 'province', 'project', 'onutype', 'service', 'service_group', 'start_date_css'];
    
    try {
        const setClause = [];
        const values = [];
        let i = 1;
        
        for (const field of fields) {
            if (updates[field] !== undefined) {
                setClause.push(`${field} = $${i++}`);
                values.push(updates[field]);
            }
        }
        
        if (setClause.length === 0) return res.status(400).json({ message: 'No fields to update' });
        
        values.push(id);
        const query = `UPDATE onu_get_olt SET ${setClause.join(', ')} WHERE id = $${i} RETURNING *`;
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update ONU Get OLT error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/onu-get-olt/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM onu_get_olt WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error('Delete ONU Get OLT error:', err);
        res.status(500).json({ message: 'Internal server error' });
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
    'ชุมสาย': 'exchange',
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
        refreshCircuitView();
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
        refreshCircuitView();
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
    } catch (err) { 
        console.error('Error checking backup status:', err);
        res.status(500).json({ message: 'Error checking backup status' }); 
    }
});

// Logs
app.get('/api/logs', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
    const { page = 1, limit = 50, sortField = 'created_at', sortOrder = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const validSortFields = ['created_at', 'username', 'action'];
    const finalSort = validSortFields.includes(sortField) ? sortField : 'created_at';

    try {
        const countResult = await pool.query('SELECT COUNT(*) FROM activity_logs');
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query(`
            SELECT l.*, u.username 
            FROM activity_logs l 
            JOIN users u ON l.user_id = u.id 
            ORDER BY ${finalSort === 'username' ? 'u.username' : 'l.' + finalSort} ${sortOrder} 
            LIMIT $1 OFFSET $2
        `, [parseInt(limit), offset]);
        res.json({ data: result.rows, total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/logs/export', authenticate, async (req, res) => {
    const { search } = req.query;
    try {
        let whereClause = '';
        const params = [];
        if (search) {
            const searchPattern = `%${search}%`;
            whereClause = `
                WHERE u.username ILIKE $1 
                OR l.action ILIKE $1 
                OR l.target_table ILIKE $1
            `;
            params.push(searchPattern);
        }
        const queryText = `
            SELECT 
                l.id as "ID", l.created_at as "เวลา", u.username as "ผู้ใช้งาน", 
                l.action as "การดำเนินการ", l.target_table as "ตาราง", 
                l.target_id as "ID เป้าหมาย", l.details::text as "รายละเอียด"
            FROM activity_logs l
            JOIN users u ON l.user_id = u.id
            ${whereClause}
            ORDER BY l.id DESC
        `;
        const result = await pool.query(queryText, params);
        const worksheet = XLSX.utils.json_to_sheet(result.rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Logs");
        const fileName = `activity_logs_export_${Date.now()}.xlsx`;
        const filePath = `uploads/${fileName}`;
        XLSX.writeFile(workbook, filePath);
        res.download(filePath, fileName, (err) => { if (!err) fs.unlinkSync(filePath); });
    } catch (err) { res.status(500).json({ message: 'Export failed' }); }
});

// CPE Management
app.get('/api/cpe-groups', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query.sortField || 'raw_name';
    const sortOrder = req.query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

    // Only allow sorting on safe columns
    const validSortFields = ['raw_name', 'brand', 'model', 'record_count'];
    const finalSort = validSortFields.includes(sortField) ? sortField : 'raw_name';

    const search = req.query.search || '';
    const searchPattern = `%${search}%`;
    const pendingOnly = req.query.pendingOnly === 'true';

    try {
        let countQuery = `
            SELECT COUNT(DISTINCT cpe_brand_model) as total 
            FROM onu_records 
            WHERE (cpe_brand_model IS NOT NULL AND cpe_brand_model != '')
            AND (cpe_brand_model ILIKE $1)
        `;
        if (pendingOnly) {
            countQuery = `
                SELECT COUNT(DISTINCT o.cpe_brand_model) as total 
                FROM onu_records o
                LEFT JOIN cpe_devices d ON o.cpe_brand_model = d.raw_name
                WHERE (o.cpe_brand_model IS NOT NULL AND o.cpe_brand_model != '')
                AND (o.cpe_brand_model ILIKE $1)
                AND d.id IS NULL
            `;
        }
        const countResult = await pool.query(countQuery, [searchPattern]);
        const total = parseInt(countResult.rows[0].total);

        const result = await pool.query(`
            WITH raw_groups AS (
                SELECT 
                    TRIM(REGEXP_REPLACE(cpe_brand_model, '[\\r\\n\\t\\s]+', ' ', 'g')) as raw_name, 
                    COUNT(*)::integer as record_count 
 
                FROM onu_records 
                WHERE (cpe_brand_model IS NOT NULL AND cpe_brand_model != '')
                GROUP BY 1
            ),
            joined AS (
                SELECT g.raw_name, g.record_count, d.brand, d.model, d.id as mapped_id
                FROM raw_groups g
                LEFT JOIN cpe_devices d ON g.raw_name = d.raw_name
            )
            SELECT * FROM joined
            WHERE (raw_name ILIKE $3 OR brand ILIKE $3 OR model ILIKE $3)
            ${pendingOnly ? ' AND mapped_id IS NULL' : ''}
            ORDER BY ${finalSort} ${sortOrder} NULLS LAST
            LIMIT $1 OFFSET $2
        `, [limit, offset, searchPattern]);
        res.json({ data: result.rows, total });
    } catch (err) {
        console.error('Error fetching CPE groups:', err);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/cpe-groups/export', authenticate, async (req, res) => {
    const { search } = req.query;
    try {
        let whereClause = '';
        const params = [];
        if (search) {
            const searchPattern = `%${search}%`;
            whereClause = `WHERE raw_name ILIKE $1 OR brand ILIKE $1 OR model ILIKE $1`;
            params.push(searchPattern);
        }
        const queryText = `SELECT raw_name as "ชื่อจากระบบ (Raw)", brand as "ยี่ห้อ (มาตรฐาน)", model as "รุ่น (มาตรฐาน)" FROM cpe_devices ${whereClause} ORDER BY raw_name ASC`;
        const result = await pool.query(queryText, params);
        const worksheet = XLSX.utils.json_to_sheet(result.rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ONU Mapping");
        const fileName = `onu_mapping_export_${Date.now()}.xlsx`;
        const filePath = `uploads/${fileName}`;
        XLSX.writeFile(workbook, filePath);
        res.download(filePath, fileName, (err) => { if (!err) fs.unlinkSync(filePath); });
    } catch (err) { res.status(500).json({ message: 'Export failed' }); }
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
        console.error('Error fetching new discoveries:', err);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/device-catalog/discovery', authenticate, async (req, res) => {
    try {
        const [onuUnmapped, wifiUnmapped, onuNoSpecs, wifiNoSpecs] = await Promise.all([
            // 1. Unmapped ONU Raw Names
            pool.query(`
                SELECT cpe_brand_model as raw_name, COUNT(*) as record_count 
                FROM onu_records o
                LEFT JOIN cpe_devices d ON o.cpe_brand_model = d.raw_name
                WHERE (o.cpe_brand_model IS NOT NULL AND o.cpe_brand_model != '')
                AND d.id IS NULL
                GROUP BY 1 ORDER BY 2 DESC LIMIT 10
            `),
            // 2. Unmapped WiFi Raw Names
            pool.query(`
                SELECT brand, model, COUNT(*) as record_count
                FROM wifi_routers w
                LEFT JOIN wifi_mappings m ON w.brand = m.raw_brand AND w.model = m.raw_model
                WHERE m.id IS NULL
                GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 10
            `),
            // 3. ONU Mappings with NO Specs in Catalog
            pool.query(`
                WITH unmapped_cpe AS (
                    SELECT d.brand, d.model, d.raw_name
                    FROM cpe_devices d
                    LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
                    WHERE c.id IS NULL
                )
                SELECT u.brand, u.model, COUNT(*) as record_count
                FROM unmapped_cpe u
                JOIN onu_records o ON o.cpe_brand_model = u.raw_name
                GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 10
            `),
            // 4. WiFi Mappings with NO Specs in Catalog
            pool.query(`
                WITH unmapped_wifi AS (
                    SELECT m.target_brand as brand, m.target_model as model, m.raw_brand, m.raw_model
                    FROM wifi_mappings m
                    LEFT JOIN device_catalog c ON m.target_brand = c.brand AND m.target_model = c.model
                    WHERE c.id IS NULL
                )
                SELECT u.brand, u.model, COUNT(*) as record_count
                FROM unmapped_wifi u
                JOIN wifi_routers w ON w.brand = u.raw_brand AND w.model = u.raw_model
                GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 10
            `)
        ]);

        res.json({
            onuUnmapped: onuUnmapped.rows,
            wifiUnmapped: wifiUnmapped.rows,
            onuNoSpecs: onuNoSpecs.rows,
            wifiNoSpecs: wifiNoSpecs.rows
        });
    } catch (err) {
        console.error('Discovery Error:', err);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/cpe-groups/missing', authenticate, async (req, res) => {
    try {
        const { search = '', sortField = 'record_count', sortOrder = 'DESC', page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const searchPattern = `%${search}%`;

        const validSorts = ['raw_name', 'record_count', 'brand', 'model'];
        const finalSort = validSorts.includes(sortField) ? sortField : 'record_count';
        const finalOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const dataQuery = `
            WITH raw_missing AS (
                SELECT 
                    ' [MISSING] OLT: ' || COALESCE(olt_brand_model, 'Unknown') as raw_name,
                    COUNT(*) as record_count 
                FROM onu_records 
                WHERE (cpe_brand_model IS NULL OR cpe_brand_model = '')
                GROUP BY 1
            )
            SELECT 
                g.raw_name, 
                g.record_count, 
                d.brand, 
                d.model, 
                d.id as mapped_id
            FROM raw_missing g
            LEFT JOIN cpe_devices d ON g.raw_name = d.raw_name
            WHERE g.raw_name ILIKE $1 OR d.brand ILIKE $1 OR d.model ILIKE $1
            ORDER BY ${finalSort} ${finalOrder}
            LIMIT $2 OFFSET $3
        `;

        const countQuery = `
            WITH raw_missing AS (
                SELECT 
                    ' [MISSING] OLT: ' || COALESCE(olt_brand_model, 'Unknown') as raw_name,
                    COUNT(*) as record_count 
                FROM onu_records 
                WHERE (cpe_brand_model IS NULL OR cpe_brand_model = '')
                GROUP BY 1
            )
            SELECT COUNT(*) FROM raw_missing g
            LEFT JOIN cpe_devices d ON g.raw_name = d.raw_name
            WHERE g.raw_name ILIKE $1 OR d.brand ILIKE $1 OR d.model ILIKE $1
        `;

        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, [searchPattern, parseInt(limit), offset]),
            pool.query(countQuery, [searchPattern])
        ]);

        res.json({ 
            data: dataResult.rows, 
            total: parseInt(countResult.rows[0].count) 
        });
    } catch (err) {
        console.error('Error fetching missing CPE groups:', err);
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
    const sortField = req.query.sortField || 'raw_brand';
    const sortOrder = req.query.sortOrder === 'DESC' ? 'DESC' : 'ASC';
    const search = req.query.search || '';
    const searchPattern = `%${search}%`;
    const pendingOnly = req.query.pendingOnly === 'true';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const validSortFields = ['raw_brand', 'raw_model', 'target_brand', 'target_model', 'record_count'];
    const finalSort = validSortFields.includes(sortField) ? sortField : 'raw_brand';

    try {
        let countQuery = `
            SELECT COUNT(DISTINCT (w.brand, w.model)) as total 
            FROM wifi_routers w
            LEFT JOIN wifi_mappings m ON w.brand = m.raw_brand AND w.model = m.raw_model
            WHERE w.brand IS NOT NULL AND w.model IS NOT NULL
            AND (w.brand ILIKE $1 OR w.model ILIKE $1)
        `;
        if (pendingOnly) {
            countQuery += ` AND m.id IS NULL`;
        }
        const countResult = await pool.query(countQuery, [searchPattern]);
        const total = parseInt(countResult.rows[0].total);

        const result = await pool.query(`
            WITH raw_groups AS (
                SELECT brand as raw_brand, model as raw_model, COUNT(*)::integer as record_count
                FROM wifi_routers 
                WHERE brand IS NOT NULL AND model IS NOT NULL
                AND (brand ILIKE $3 OR model ILIKE $3)
                GROUP BY brand, model
            ),
            joined AS (
                SELECT g.raw_brand, g.raw_model, g.record_count, m.target_brand, m.target_model, m.id as mapped_id
                FROM raw_groups g
                LEFT JOIN wifi_mappings m ON g.raw_brand = m.raw_brand AND g.raw_model = m.raw_model
            )
            SELECT * FROM joined
            WHERE (raw_brand ILIKE $3 OR raw_model ILIKE $3 OR target_brand ILIKE $3 OR target_model ILIKE $3)
            ${pendingOnly ? ' AND mapped_id IS NULL' : ''}
            ORDER BY ${finalSort} ${sortOrder} NULLS LAST
            LIMIT $1 OFFSET $2
        `, [limit, offset, searchPattern]);
        res.json({ data: result.rows, total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ONU Get OLT Mapping Groups
app.get('/api/onu-get-olt-groups', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query.sortField || 'raw_name';
    const sortOrder = req.query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const validSortFields = ['raw_name', 'brand', 'model', 'record_count'];
    const finalSort = validSortFields.includes(sortField) ? sortField : 'raw_name';

    const search = req.query.search || '';
    const searchPattern = `%${search}%`;
    const pendingOnly = req.query.pendingOnly === 'true';

    try {
        let countQuery = `
            SELECT COUNT(DISTINCT onu_actual_type) as total 
            FROM onu_get_olt 
            WHERE (onu_actual_type IS NOT NULL AND onu_actual_type != '')
            AND (onu_actual_type ILIKE $1)
        `;
        if (pendingOnly) {
            countQuery = `
                SELECT COUNT(DISTINCT o.onu_actual_type) as total 
                FROM onu_get_olt o
                LEFT JOIN cpe_devices d ON o.onu_actual_type = d.raw_name
                WHERE (o.onu_actual_type IS NOT NULL AND o.onu_actual_type != '')
                AND (o.onu_actual_type ILIKE $1)
                AND d.id IS NULL
            `;
        }
        const countResult = await pool.query(countQuery, [searchPattern]);
        const total = parseInt(countResult.rows[0].total);

        const result = await pool.query(`
            WITH raw_groups AS (
                SELECT 
                    TRIM(REGEXP_REPLACE(onu_actual_type, '[\\r\\n\\t\\s]+', ' ', 'g')) as raw_name, 
                    COUNT(*)::integer as record_count 
 
                FROM onu_get_olt 
                WHERE (onu_actual_type IS NOT NULL AND onu_actual_type != '')
                GROUP BY 1
            ),
            joined AS (
                SELECT g.raw_name, g.record_count, d.brand, d.model, d.id as mapped_id
                FROM raw_groups g
                LEFT JOIN cpe_devices d ON g.raw_name = d.raw_name
            )
            SELECT * FROM joined
            WHERE (raw_name ILIKE $3 OR brand ILIKE $3 OR model ILIKE $3)
            ${pendingOnly ? ' AND mapped_id IS NULL' : ''}
            ORDER BY ${finalSort} ${sortOrder} NULLS LAST
            LIMIT $1 OFFSET $2
        `, [limit, offset, searchPattern]);
        res.json({ data: result.rows, total });
    } catch (err) {
        console.error('Error fetching ONU Get OLT groups:', err);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/onu-get-olt-groups/new-discoveries', authenticate, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT onu_actual_type as raw_name 
            FROM onu_get_olt 
            WHERE onu_actual_type IS NOT NULL AND onu_actual_type != ''
            AND onu_actual_type NOT IN (SELECT raw_name FROM cpe_devices)
        `);
        res.json({ data: result.rows });
    } catch (err) {
        console.error('Error fetching new ONU Get OLT discoveries:', err);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/onu-get-olt-groups/export', authenticate, async (req, res) => {
    const { search } = req.query;
    try {
        const searchPattern = `%${search || ''}%`;
        const queryText = `
            WITH raw_groups AS (
                SELECT DISTINCT onu_actual_type as raw_name
                FROM onu_get_olt 
                WHERE onu_actual_type IS NOT NULL AND onu_actual_type != ''
                AND onu_actual_type ILIKE $1
            ),
            joined AS (
                SELECT g.raw_name as "ชื่อจากระบบ (Raw)", d.brand as "ยี่ห้อ (มาตรฐาน)", d.model as "รุ่น (มาตรฐาน)"
                FROM raw_groups g
                LEFT JOIN cpe_devices d ON g.raw_name = d.raw_name
            )
            SELECT * FROM joined ORDER BY "ชื่อจากระบบ (Raw)" ASC
        `;
        const result = await pool.query(queryText, [searchPattern]);
        const worksheet = XLSX.utils.json_to_sheet(result.rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ONU Get OLT Mapping");
        const fileName = `onu_get_olt_mapping_export_${Date.now()}.xlsx`;
        const filePath = `uploads/${fileName}`;
        XLSX.writeFile(workbook, filePath);
        res.download(filePath, fileName, (err) => { if (!err) fs.unlinkSync(filePath); });
    } catch (err) { res.status(500).json({ message: 'Export failed' }); }
});

app.get('/api/wifi-mappings/groups/export', authenticate, async (req, res) => {
    const { search } = req.query;
    try {
        const searchPattern = `%${search || ''}%`;
        const queryText = `
            WITH raw_groups AS (
                SELECT DISTINCT brand as raw_brand, model as raw_model
                FROM wifi_routers 
                WHERE brand IS NOT NULL AND model IS NOT NULL
                AND (brand ILIKE $1 OR model ILIKE $1)
            ),
            joined AS (
                SELECT g.raw_brand as "ยี่ห้อ (ดิบ)", g.raw_model as "รุ่น (ดิบ)", m.target_brand as "ยี่ห้อ (มาตรฐาน)", m.target_model as "รุ่น (มาตรฐาน)"
                FROM raw_groups g
                LEFT JOIN wifi_mappings m ON g.raw_brand = m.raw_brand AND g.raw_model = m.raw_model
            )
            SELECT * FROM joined ORDER BY "ยี่ห้อ (ดิบ)" ASC
        `;
        const result = await pool.query(queryText, [searchPattern]);
        const worksheet = XLSX.utils.json_to_sheet(result.rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "WiFi Mapping");
        const fileName = `wifi_mapping_export_${Date.now()}.xlsx`;
        const filePath = `uploads/${fileName}`;
        XLSX.writeFile(workbook, filePath);
        res.download(filePath, fileName, (err) => { if (!err) fs.unlinkSync(filePath); });
    } catch (err) { res.status(500).json({ message: 'Export failed' }); }
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
        refreshCircuitView();
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
        refreshCircuitView();
        res.json({ message: 'Mapping deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Device Catalog - All (for autocomplete, no pagination)
app.get('/api/device-catalog/all', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, brand, model, type, version, lan_ge, lan_fe, wifi, usage, grade, price, max_speed FROM device_catalog ORDER BY brand ASC, model ASC');
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

    const validSortFields = ['brand', 'model', 'type', 'version', 'lan_ge', 'lan_fe', 'wifi', 'usage', 'grade', 'price', 'max_speed', 'record_count'];
    const finalSort = validSortFields.includes(sortField) ? sortField : 'brand';

    const search = req.query.search || '';
    const searchPattern = `%${search}%`;

    try {
        const countResult = await pool.query(`
            SELECT COUNT(*) FROM device_catalog 
            WHERE (brand ILIKE $1 OR model ILIKE $1 OR type ILIKE $1 OR version ILIKE $1 OR lan_ge ILIKE $1 OR lan_fe ILIKE $1 OR wifi ILIKE $1 OR usage ILIKE $1 OR grade ILIKE $1)
        `, [searchPattern]);
        const total = parseInt(countResult.rows[0].count);
        
        // Use CTE for better performance and accurate counting across all sources
        const result = await pool.query(`
            WITH onu_counts AS (
                SELECT d.brand, d.model, COUNT(*) as count
                FROM onu_records o
                JOIN cpe_devices d ON d.raw_name = COALESCE(NULLIF(o.cpe_brand_model, ''), ' [MISSING] OLT: ' || COALESCE(o.olt_brand_model, 'Unknown'))
                GROUP BY d.brand, d.model
            ),
            wifi_counts AS (
                SELECT m.target_brand as brand, m.target_model as model, COUNT(*) as count
                FROM wifi_mappings m
                JOIN wifi_routers w ON w.brand = m.raw_brand AND w.model = m.raw_model
                GROUP BY m.target_brand, m.target_model
            ),
            olt_counts AS (
                SELECT d.brand, d.model, COUNT(*) as count
                FROM cpe_devices d
                JOIN onu_get_olt g ON g.onu_actual_type = d.raw_name
                GROUP BY d.brand, d.model
            )
            SELECT c.*,
                (COALESCE(oc.count, 0) + COALESCE(wc.count, 0) + COALESCE(olc.count, 0))::integer as record_count
            FROM device_catalog c
            LEFT JOIN onu_counts oc ON c.brand = oc.brand AND c.model = oc.model
            LEFT JOIN wifi_counts wc ON c.brand = wc.brand AND c.model = wc.model
            LEFT JOIN olt_counts olc ON c.brand = olc.brand AND c.model = olc.model
            WHERE (c.brand ILIKE $3 OR c.model ILIKE $3 OR c.type ILIKE $3 OR c.version ILIKE $3 OR c.lan_ge ILIKE $3 OR c.lan_fe ILIKE $3 OR c.wifi ILIKE $3 OR c.usage ILIKE $3 OR c.grade ILIKE $3)
            ORDER BY ${finalSort === 'record_count' ? 'record_count' : 'c.' + finalSort} ${sortOrder} 
            LIMIT $1 OFFSET $2
        `, [limit, offset, searchPattern]);
        res.json({ data: result.rows, total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/device-catalog/export', authenticate, async (req, res) => {
    const { search } = req.query;
    try {
        let whereClause = '';
        const params = [];
        if (search) {
            const searchPattern = `%${search}%`;
            whereClause = `WHERE brand ILIKE $1 OR model ILIKE $1 OR type ILIKE $1`;
            params.push(searchPattern);
        }
        const queryText = `
            SELECT 
                brand as "ยี่ห้อ", model as "รุ่น", type as "Type", 
                version as "Version", lan_ge as "LAN GE", lan_fe as "LAN FE", 
                wifi as "WiFi Spec", usage as "Usage", grade as "Grade", 
                price as "ราคา", max_speed as "Max Speed"
            FROM device_catalog ${whereClause} ORDER BY brand ASC, model ASC
        `;
        const result = await pool.query(queryText, params);
        const worksheet = XLSX.utils.json_to_sheet(result.rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Device Catalog");
        const fileName = `device_catalog_export_${Date.now()}.xlsx`;
        const filePath = `uploads/${fileName}`;
        XLSX.writeFile(workbook, filePath);
        res.download(filePath, fileName, (err) => { if (!err) fs.unlinkSync(filePath); });
    } catch (err) { res.status(500).json({ message: 'Export failed' }); }
});

app.post('/api/device-catalog', authenticate, async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    const { brand, model, type, version, lan_ge, lan_fe, wifi, usage, grade, price, max_speed } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO device_catalog (brand, model, type, version, lan_ge, lan_fe, wifi, usage, grade, price, max_speed, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
            ON CONFLICT (brand, model) 
            DO UPDATE SET 
                type = EXCLUDED.type,
                version  = EXCLUDED.version,
                lan_ge   = EXCLUDED.lan_ge,
                lan_fe   = EXCLUDED.lan_fe,
                wifi     = EXCLUDED.wifi,
                usage    = EXCLUDED.usage,
                grade    = EXCLUDED.grade,
                price    = EXCLUDED.price,
                max_speed = EXCLUDED.max_speed,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [brand, model, type, version, lan_ge, lan_fe, wifi, usage, grade, price, max_speed]);
        
        await logActivity(req.user.id, 'CATALOG_UPDATE', 'device_catalog', result.rows[0].id, req.body);
        refreshCircuitView();
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/device-catalog/:id', authenticate, async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const { brand, model, type, version, lan_ge, lan_fe, wifi, usage, grade, price, max_speed } = req.body;
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Get old brand/model
        const oldRes = await client.query('SELECT brand, model FROM device_catalog WHERE id = $1', [id]);
        if (oldRes.rows.length === 0) throw new Error('Catalog entry not found');
        const old = oldRes.rows[0];
        
        // 2. Update catalog
        const result = await client.query(`
            UPDATE device_catalog SET 
                brand = $1, model = $2, type = $3, version = $4, 
                lan_ge = $5, lan_fe = $6, wifi = $7, usage = $8, 
                grade = $9, price = $10, max_speed = $11, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $12
            RETURNING *
        `, [brand, model, type, version, lan_ge, lan_fe, wifi, usage, grade, price, max_speed, id]);
        
        // 3. If brand or model changed, update mappings
        if (old.brand !== brand || old.model !== model) {
            await client.query('UPDATE cpe_devices SET brand = $1, model = $2 WHERE brand = $3 AND model = $4', [brand, model, old.brand, old.model]);
            await client.query('UPDATE wifi_mappings SET target_brand = $1, target_model = $2 WHERE target_brand = $3 AND target_model = $4', [brand, model, old.brand, old.model]);
        }
        
        await client.query('COMMIT');
        await logActivity(req.user.id, 'CATALOG_UPDATE', 'device_catalog', id, req.body);
        refreshCircuitView();
        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

app.get('/api/device-catalog/:id/impact', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const catalogRes = await pool.query('SELECT brand, model FROM device_catalog WHERE id = $1', [id]);
        if (catalogRes.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        
        const { brand, model } = catalogRes.rows[0];
        const cpeCount = await pool.query('SELECT COUNT(*) FROM cpe_devices WHERE brand = $1 AND model = $2', [brand, model]);
        const wifiCount = await pool.query('SELECT COUNT(*) FROM wifi_mappings WHERE target_brand = $1 AND target_model = $2', [brand, model]);
        
        res.json({
            brand,
            model,
            cpeCount: parseInt(cpeCount.rows[0].count),
            wifiCount: parseInt(wifiCount.rows[0].count)
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/device-catalog/:id', authenticate, async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM device_catalog WHERE id = $1', [id]);
        await logActivity(req.user.id, 'CATALOG_DELETE', 'device_catalog', id, { id });
        refreshCircuitView();
        res.json({ message: 'Device specification deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/device-catalog/upload', authenticate, upload.single('file'), async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Backup
        await client.query('TRUNCATE device_catalog_backup');
        const cols = 'brand, model, type, version, lan_ge, lan_fe, wifi, usage, grade, price, max_speed, created_at, updated_at';
        await client.query(`INSERT INTO device_catalog_backup (${cols}) SELECT ${cols} FROM device_catalog`);
        
        const workbook = XLSX.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        
        let insertedCount = 0;
        let updatedCount = 0;
        for (const row of rawData) {
            const mappedRow = {};
            for (const [thai, english] of Object.entries(CATALOG_COLUMN_MAP)) {
                let val = row[thai];
                if (val === 'NULL' || val === '' || val === '-') {
                    val = null;
                }
                
                if (val !== null && val !== undefined) {
                    if (english === 'price') {
                        val = parseFloat(String(val).replace(/,/g, ''));
                        if (isNaN(val)) val = null;
                    } else {
                        val = String(val).trim();
                    }
                } else {
                    val = null;
                }
                mappedRow[english] = val;
            }

            if (!mappedRow.brand || !mappedRow.model) continue;

            const query = `
                INSERT INTO device_catalog (brand, model, type, version, lan_ge, lan_fe, wifi, usage, grade, price, max_speed, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
                ON CONFLICT (brand, model) DO UPDATE SET
                    type = EXCLUDED.type,
                    version = EXCLUDED.version,
                    lan_ge = EXCLUDED.lan_ge,
                    lan_fe = EXCLUDED.lan_fe,
                    wifi = EXCLUDED.wifi,
                    usage = EXCLUDED.usage,
                    grade = EXCLUDED.grade,
                    price = EXCLUDED.price,
                    max_speed = EXCLUDED.max_speed,
                    updated_at = CURRENT_TIMESTAMP
            `;

            const values = [
                mappedRow.brand, mappedRow.model, mappedRow.type, mappedRow.version,
                mappedRow.lan_ge, mappedRow.lan_fe, mappedRow.wifi, mappedRow.usage,
                mappedRow.grade, mappedRow.price, mappedRow.max_speed
            ];

            const result = await client.query(query + ' RETURNING (xmax = 0) AS inserted', values);
            if (result.rows[0].inserted) insertedCount++;
            else updatedCount++;
        }
        
        await client.query('COMMIT');
        await logActivity(req.user.id, 'CATALOG_UPLOAD', 'device_catalog', 0, { inserted: insertedCount, updated: updatedCount });
        refreshCircuitView();
        res.json({ message: 'Import successful', inserted: insertedCount, updated: updatedCount });
    } catch (err) {
        console.error('Catalog Import Error:', err);
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Import failed: ' + err.message });
    } finally {
        client.release();
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
});

app.post('/api/device-catalog/restore', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const countRes = await client.query('SELECT COUNT(*) FROM device_catalog_backup');
        if (parseInt(countRes.rows[0].count) === 0) throw new Error('No backup data found');
        await client.query('TRUNCATE device_catalog');
        const cols = 'brand, model, type, version, lan_ge, lan_fe, wifi, usage, grade, price, max_speed, created_at, updated_at';
        await client.query(`INSERT INTO device_catalog (${cols}) SELECT ${cols} FROM device_catalog_backup`);
        await client.query('COMMIT');
        res.json({ message: 'Restore successful' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

app.get('/api/device-catalog/backup-status', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM device_catalog_backup');
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
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

const CATALOG_COLUMN_MAP = {
    'ยี่ห้อ': 'brand',
    'รุ่น': 'model',
    'Type': 'type',
    'Version': 'version',
    'LAN GE': 'lan_ge',
    'LAN FE': 'lan_fe',
    'WiFi Spec': 'wifi',
    'Usage': 'usage',
    'Grade': 'grade',
    'ราคา': 'price',
    'Max Speed': 'max_speed'
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

app.get('/api/wifi-routers/export', authenticate, async (req, res) => {
    const { search } = req.query;
    try {
        let whereClause = '';
        const params = [];
        if (search) {
            const searchPattern = `%${search}%`;
            whereClause = `WHERE circuit_id ILIKE $1 OR brand ILIKE $1 OR model ILIKE $1`;
            params.push(searchPattern);
        }
        const queryText = `SELECT circuit_id as "หมายเลขวงจร", brand as "ยี่ห้อ", model as "รุ่น", version as "เวอร์ชัน" FROM wifi_routers ${whereClause} ORDER BY id DESC`;
        const result = await pool.query(queryText, params);
        const worksheet = XLSX.utils.json_to_sheet(result.rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "WiFi Routers");
        const fileName = `wifi_routers_export_${Date.now()}.xlsx`;
        const filePath = `uploads/${fileName}`;
        XLSX.writeFile(workbook, filePath);
        res.download(filePath, fileName, (err) => { if (!err) fs.unlinkSync(filePath); });
    } catch (err) { res.status(500).json({ message: 'Export failed' }); }
});

app.post('/api/wifi-routers', authenticate, async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    const { circuit_id, brand, model, version } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO wifi_routers (circuit_id, brand, model, version) VALUES ($1, $2, $3, $4) RETURNING *',
            [circuit_id, brand, model, version]
        );
        await logActivity(req.user.id, 'CREATE_WIFI', 'wifi_routers', result.rows[0].id, req.body);
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/wifi-routers/:id', authenticate, async (req, res) => {
    if (req.user.role === 'viewer') return res.status(403).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const { circuit_id, brand, model, version } = req.body;
    try {
        const result = await pool.query(
            'UPDATE wifi_routers SET circuit_id = $1, brand = $2, model = $3, version = $4 WHERE id = $5 RETURNING *',
            [circuit_id, brand, model, version, id]
        );
        await logActivity(req.user.id, 'UPDATE_WIFI', 'wifi_routers', id, req.body);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/wifi-routers/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM wifi_routers WHERE id = $1', [id]);
        await logActivity(req.user.id, 'DELETE_WIFI', 'wifi_routers', id, { id });
        res.json({ message: 'Deleted' });
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
            INSERT INTO device_catalog (brand, model, type)
            SELECT DISTINCT brand, model, 'WiFi Router' 
            FROM wifi_routers 
            WHERE brand IS NOT NULL AND model IS NOT NULL
            ON CONFLICT (brand, model) DO UPDATE SET type = EXCLUDED.type
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
            INSERT INTO device_catalog (brand, model, type)
            SELECT DISTINCT brand, model, 'WiFi Router' 
            FROM wifi_routers 
            WHERE brand IS NOT NULL AND model IS NOT NULL
            ON CONFLICT (brand, model) DO UPDATE SET type = EXCLUDED.type
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

// Dashboard Summary
// Dashboard Summary (Integrated Logic)
app.get('/api/dashboard/summary', authenticate, async (req, res) => {
    const { search, page = 1, limit = 10, sortField = 'circuit_id', sortOrder = 'ASC', group = 'all' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    try {
        let whereClause = '';
        const params = [];
        let paramIdx = 1;

        // Base Filter for search
        let searchClause = '';
        if (search) {
            const searchPattern = `%${search}%`;
            searchClause = `
                (COALESCE(o.circuit_id, w.circuit_id) ILIKE $${paramIdx} 
                OR o.request_id ILIKE $${paramIdx} 
                OR d.brand ILIKE $${paramIdx}
                OR d.model ILIKE $${paramIdx}
                OR w.brand ILIKE $${paramIdx}
                OR w.model ILIKE $${paramIdx}
                OR c.type ILIKE $${paramIdx}
                OR wc.type ILIKE $${paramIdx})
            `;
            params.push(searchPattern);
            paramIdx++;
        }

        // Group Filter Logic
        let groupClause = '';
        if (group === 'onu') {
            groupClause = `(c.type ILIKE '%ONU%' OR (o.circuit_id IS NOT NULL AND c.type IS NULL))`;
        } else if (group === 'other') {
            groupClause = `((c.type NOT ILIKE '%ONU%' AND c.type IS NOT NULL) OR (o.circuit_id IS NULL AND w.circuit_id IS NOT NULL))`;
        }

        if (searchClause || groupClause) {
            whereClause = 'WHERE ' + [searchClause, groupClause].filter(Boolean).join(' AND ');
        }

        const validSorts = ['circuit_id', 'request_id', 'installation_close_date', 'onu_brand', 'onu_model', 'onu_type', 'wifi_router_brand', 'wifi_router_model'];
        const finalSort = validSorts.includes(sortField) ? sortField : 'circuit_id';

        const query = `
            SELECT 
                COALESCE(o.circuit_id, w.circuit_id) as circuit_id,
                o.request_id,
                o.section,
                o.speed,
                o.installation_close_date,
                o.cpe_brand_model,
                COALESCE(c.brand, d.brand) as onu_brand,
                COALESCE(c.model, d.model) as onu_model,
                COALESCE(c.type, 'Unknown') as onu_type,
                c.lan_ge as onu_lan_ge,
                c.lan_fe as onu_lan_fe,
                c.wifi as onu_wifi_spec,
                COALESCE(wc.brand, w.brand) as wifi_router_brand,
                COALESCE(wc.model, w.model) as wifi_router_model,
                COALESCE(wc.type, 'Unknown') as wifi_router_type,
                wc.wifi as wifi_router_spec,
                (o.circuit_id IS NOT NULL AND d.id IS NULL) as onu_pending,
                (w.circuit_id IS NOT NULL AND wm.id IS NULL) as wifi_pending
            FROM onu_records o
            FULL OUTER JOIN wifi_routers w ON o.circuit_id = w.circuit_id
            LEFT JOIN cpe_devices d ON d.raw_name = COALESCE(NULLIF(o.cpe_brand_model, ''), ' [MISSING] OLT: ' || COALESCE(o.olt_brand_model, 'Unknown'))
            LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
            LEFT JOIN wifi_mappings wm ON w.brand = wm.raw_brand AND w.model = wm.raw_model
            LEFT JOIN device_catalog wc ON wm.target_brand = wc.brand AND wm.target_model = wc.model
            ${whereClause}
            ORDER BY ${finalSort === 'circuit_id' ? 'COALESCE(o.circuit_id, w.circuit_id)' : finalSort} ${sortOrder}
            LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
        `;

        const countQuery = `
            SELECT COUNT(*) 
            FROM onu_records o
            FULL OUTER JOIN wifi_routers w ON o.circuit_id = w.circuit_id
            LEFT JOIN cpe_devices d ON d.raw_name = COALESCE(NULLIF(o.cpe_brand_model, ''), ' [MISSING] OLT: ' || COALESCE(o.olt_brand_model, 'Unknown'))
            LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
            LEFT JOIN wifi_mappings wm ON w.brand = wm.raw_brand AND w.model = wm.raw_model
            LEFT JOIN device_catalog wc ON wm.target_brand = wc.brand AND wm.target_model = wc.model
            ${whereClause}
        `;

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, [...params, parseInt(limit), offset]),
            pool.query(countQuery, params)
        ]);

        res.json({ 
            data: dataResult.rows, 
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error('Dashboard Integrated Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/onu/export', authenticate, async (req, res) => {
    const { search } = req.query;
    const QueryStream = require('pg-query-stream');
    const ExcelJS = require('exceljs');
    try {
        let whereClause = '';
        const params = [];
        if (search) {
            const searchPattern = `%${search}%`;
            whereClause = `
                WHERE request_id ILIKE $1 
                OR circuit_id ILIKE $1 
                OR cpe_brand_model ILIKE $1 
                OR province ILIKE $1
            `;
            params.push(searchPattern);
        }
        const queryText = `SELECT * FROM onu_records ${whereClause} ORDER BY id DESC`;
        const client = await pool.connect();
        try {
            const query = new QueryStream(queryText, params);
            const stream = client.query(query);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=onu_records_${Date.now()}.xlsx`);
            const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
            const worksheet = workbook.addWorksheet('ONU Records');
            
            let isFirst = true;
            for await (const row of stream) {
                if (isFirst) {
                    worksheet.columns = Object.keys(row).map(key => ({ header: key, key: key }));
                    isFirst = false;
                }
                worksheet.addRow(row).commit();
            }
            await workbook.commit();
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('ONU Export Error:', err);
        if (!res.headersSent) res.status(500).json({ message: 'Export failed' });
    }
});

// Dashboard Export Excel
app.get('/api/dashboard/export', authenticate, async (req, res) => {
    const { search } = req.query;
    try {
        let whereClause = '';
        const params = [];
        if (search) {
            const searchPattern = `%${search}%`;
            whereClause = `
                WHERE ac.circuit_id ILIKE $1 
                OR o.request_id ILIKE $1 
                OR d.brand ILIKE $1
                OR d.model ILIKE $1
                OR w.brand ILIKE $1
                OR w.model ILIKE $1
                OR c.type ILIKE $1
            `;
            params.push(searchPattern);
        }

        const query = `
            WITH all_circuits AS (
                SELECT circuit_id FROM onu_records WHERE circuit_id IS NOT NULL AND circuit_id != ''
                UNION
                SELECT circuit_id FROM wifi_routers WHERE circuit_id IS NOT NULL AND circuit_id != ''
            )
            SELECT 
                o.section as "ส่วน",
                o.exchange as "ชุมสาย",
                ac.circuit_id as "หมายเลขวงจร",
                o.request_id as "รหัสใบคำขอ",
                o.installation_close_date as "วันที่ปิดงานติดตั้ง",
                o.province as "จังหวัด(ติดตั้ง)",
                o.main_service as "บริการหลัก",
                o.speed as "ความเร็ว",
                o.price as "ราคา (บาท/เดือน)",
                o.service_name as "servicesname",
                o.promotion_start_date as "วันที่เริ่มโปรโมชัน",
                o.cpe_brand_model as "ยี่ห้อ CPE : รุ่น",
                o.olt_brand_model as "ยี่ห้อ OLT : รุ่น",
                o.cpe_status as "สถานะอุปกรณ์ปลายทาง (CPE)",
                o.service_status as "สถานะบริการ",
                COALESCE(c.brand, d.brand) as "ยี่ห้อ ONU (มาตรฐาน)",
                COALESCE(c.model, d.model) as "รุ่น ONU (มาตรฐาน)",
                c.type as "ONU Type",
                c.version as "ONU Version",
                c.lan_ge as "ONU LAN GE",
                c.lan_fe as "ONU LAN FE",
                COALESCE(c.wifi, '-') as "ONU WiFi Spec",
                c.usage as "ONU Usage",
                c.grade as "ONU Grade",
                c.price as "ONU Price (Catalog)",
                c.max_speed as "ONU Max Speed",
                w.brand as "ยี่ห้อ WiFi Router (ดิบ)",
                w.model as "รุ่น WiFi Router (ดิบ)",
                w.version as "Version WiFi Router (ดิบ)",
                COALESCE(wc.brand, wm.target_brand) as "ยี่ห้อ WiFi Router (มาตรฐาน)",
                COALESCE(wc.model, wm.target_model) as "รุ่น WiFi Router (มาตรฐาน)",
                wc.type as "WiFi Router Type",
                wc.version as "WiFi Router Version",
                wc.lan_ge as "WiFi Router LAN GE",
                wc.lan_fe as "WiFi Router LAN FE",
                COALESCE(wc.wifi, '-') as "WiFi Router Spec",
                wc.usage as "WiFi Router Usage",
                wc.grade as "WiFi Router Grade",
                wc.price as "WiFi Router Price (Catalog)",
                wc.max_speed as "WiFi Router Max Speed",
                gl.brand as "OLT Brand (Raw)",
                gl.onu_actual_type as "ONU Actual Type (Raw)",
                gl.onutype as "ONU Type (Raw)",
                gl.service as "Service ID (Raw)",
                gl.start_date_css as "Start Date CSS (Raw)"
            FROM all_circuits ac
            LEFT JOIN onu_records o ON ac.circuit_id = o.circuit_id
            LEFT JOIN cpe_devices d ON 
                (o.cpe_brand_model = d.raw_name) OR 
                ((o.cpe_brand_model IS NULL OR o.cpe_brand_model = '') AND d.raw_name = ' [MISSING] OLT: ' || COALESCE(o.olt_brand_model, 'Unknown'))
            LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
            LEFT JOIN wifi_routers w ON ac.circuit_id = w.circuit_id
            LEFT JOIN wifi_mappings wm ON w.brand = wm.raw_brand AND w.model = wm.raw_model
            LEFT JOIN device_catalog wc ON wm.target_brand = wc.brand AND wm.target_model = wc.model
            LEFT JOIN (SELECT DISTINCT ON (service) * FROM onu_get_olt ORDER BY service, id DESC) gl ON split_part(ac.circuit_id, '@', 1) = gl.service
            ${whereClause}
            ORDER BY ac.circuit_id ASC
        `;

        const ExcelJS = require('exceljs');
        const QueryStream = require('pg-query-stream');
        
        const fileName = `dashboard_export_${Date.now()}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        
        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
            stream: res,
            useStyles: false,
            useSharedStrings: false
        });
        
        const worksheet = workbook.addWorksheet('Integrated Report');
        const client = await pool.connect();
        try {
            const query_obj = new QueryStream(query, params);
            const stream = client.query(query_obj);
            
            let isFirst = true;
            for await (const row of stream) {
                if (isFirst) {
                    worksheet.columns = Object.keys(row).map(key => ({ header: key, key: key }));
                    isFirst = false;
                }
                worksheet.addRow(row).commit();
            }
            
            await workbook.commit();
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Export Error:', err);
        if (!res.headersSent) res.status(500).json({ error: 'Export failed' });
    }
});

// Dashboard Stats (Integrated)
app.get('/api/dashboard/stats', authenticate, async (req, res) => {
    try {
        const statsRes = await pool.query(`
            WITH integrated AS (
                SELECT 
                    o.circuit_id as onu_record_id,
                    d.id as onu_mapping_id,
                    COALESCE(c.brand, d.brand) as onu_brand,
                    c.type as onu_type,
                    w.id as wifi_id,
                    wm.id as wifi_mapping_id,
                    COALESCE(wc.brand, w.brand) as wifi_standard_brand
                FROM onu_records o
                LEFT JOIN cpe_devices d ON d.raw_name = COALESCE(NULLIF(o.cpe_brand_model, ''), ' [MISSING] OLT: ' || COALESCE(o.olt_brand_model, 'Unknown'))
                LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
                FULL OUTER JOIN wifi_routers w ON o.circuit_id = w.circuit_id
                LEFT JOIN wifi_mappings wm ON w.brand = wm.raw_brand AND w.model = wm.raw_model
                LEFT JOIN device_catalog wc ON wm.target_brand = wc.brand AND wm.target_model = wc.model
                WHERE (o.circuit_id IS NOT NULL AND o.circuit_id != '') OR (w.circuit_id IS NOT NULL AND w.circuit_id != '')
            )
            SELECT 
                COUNT(*) as total_records,
                COUNT(CASE WHEN wifi_id IS NOT NULL THEN 1 END) as wifi_router_count,
                COUNT(CASE WHEN onu_type ILIKE '%ALL IN ONE%' THEN 1 END) as all_in_one_count,
                COUNT(CASE WHEN onu_record_id IS NOT NULL AND wifi_id IS NULL AND (onu_type IS NULL OR onu_type NOT ILIKE '%ALL IN ONE%') THEN 1 END) as only_onu_count,
                COUNT(CASE WHEN onu_record_id IS NOT NULL AND onu_mapping_id IS NULL THEN 1 END) as pending_onu_mapping,
                COUNT(CASE WHEN wifi_id IS NOT NULL AND wifi_mapping_id IS NULL THEN 1 END) as pending_wifi_mapping,
                (SELECT COUNT(DISTINCT onu_actual_type) FROM onu_get_olt o LEFT JOIN cpe_devices d ON o.onu_actual_type = d.raw_name WHERE o.onu_actual_type IS NOT NULL AND o.onu_actual_type != '' AND d.id IS NULL) as pending_onu_get_olt_mapping,
                -- Breakdown by brand for All In One
                (SELECT json_agg(t) FROM (
                    SELECT COALESCE(onu_brand, 'Unknown') as brand, COUNT(*) as count 
                    FROM integrated 
                    WHERE onu_type ILIKE '%ALL IN ONE%' 
                    GROUP BY brand ORDER BY count DESC LIMIT 10
                ) t) as all_in_one_by_brand,
                -- Breakdown by brand for WiFi Router
                (SELECT json_agg(t) FROM (
                    SELECT COALESCE(wifi_standard_brand, 'Unknown') as brand, COUNT(*) as count 
                    FROM integrated 
                    WHERE wifi_id IS NOT NULL 
                    GROUP BY brand ORDER BY count DESC LIMIT 10
                ) t) as wifi_router_by_brand,
                -- Breakdown by brand for Only ONU
                (SELECT json_agg(t) FROM (
                    SELECT COALESCE(onu_brand, 'Unknown') as brand, COUNT(*) as count 
                    FROM integrated 
                    WHERE onu_record_id IS NOT NULL AND wifi_id IS NULL AND (onu_type IS NULL OR onu_type NOT ILIKE '%ALL IN ONE%')
                    GROUP BY brand ORDER BY count DESC LIMIT 10
                ) t) as only_onu_by_brand
            FROM integrated
        `);

        const data = statsRes.rows[0];
        res.json({
            summary: {
                total_records: parseInt(data.total_records),
                wifi_router_count: parseInt(data.wifi_router_count),
                all_in_one_count: parseInt(data.all_in_one_count),
                only_onu_count: parseInt(data.only_onu_count),
                pending_onu_mapping: parseInt(data.pending_onu_mapping),
                pending_wifi_mapping: parseInt(data.pending_wifi_mapping),
                pending_onu_get_olt_mapping: parseInt(data.pending_onu_get_olt_mapping)
            },
            all_in_one_by_brand: data.all_in_one_by_brand || [],
            wifi_router_by_brand: data.wifi_router_by_brand || [],
            only_onu_by_brand: data.only_onu_by_brand || []
        });
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ message: 'Error' });
    }
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

        const validSortFields = [
            'id', 'request_id', 'circuit_id', 'created_at', 'installation_close_date', 'province', 
            'mapped_brand', 'mapped_model', 'type', 'version', 'lan_ge', 'lan_fe', 'wifi', 'usage', 'grade', 'device_price', 'device_max_speed',
            'wifi_brand', 'wifi_model', 'wifi_mapped_brand', 'wifi_mapped_model', 
            'olt_brand', 'olt_mapped_brand', 'olt_mapped_model'
        ];
        const finalSortField = validSortFields.includes(sortField) ? sortField : 'id';

        const query = `
            SELECT 
                o.*,
                d.brand as mapped_brand,
                d.model as mapped_model,
                c.type,
                c.version,
                c.lan_ge,
                c.lan_fe,
                c.wifi,
                c.usage,
                c.grade,
                c.price as device_price,
                c.max_speed as device_max_speed,
                w.brand as wifi_brand,
                w.model as wifi_model,
                w.version as wifi_version,
                wm.target_brand as wifi_mapped_brand,
                wm.target_model as wifi_mapped_model,
                wc.type as wifi_hw_type,
                wc.version as wifi_hw_version,
                wc.lan_ge as wifi_lan_ge,
                wc.lan_fe as wifi_lan_fe,
                wc.wifi as wifi_wifi_spec,
                wc.usage as wifi_usage,
                wc.grade as wifi_grade,
                wc.price as wifi_price,
                wc.max_speed as wifi_max_speed,
                gl.brand as olt_brand,
                gl.onu_actual_type as onu_actual_type_raw,
                gl.onutype as onu_type_raw,
                gl.service as service_id_raw,
                gl.start_date_css as start_date_css_raw,
                od.brand as olt_mapped_brand,
                od.model as olt_mapped_model,
                oc.type as olt_hw_type,
                oc.version as olt_hw_version,
                oc.lan_ge as olt_lan_ge,
                oc.lan_fe as olt_lan_fe,
                oc.wifi as olt_wifi_spec,
                oc.usage as olt_usage,
                oc.grade as olt_grade,
                oc.price as olt_price,
                oc.max_speed as olt_max_speed
            FROM onu_records o
            LEFT JOIN cpe_devices d ON 
                (o.cpe_brand_model = d.raw_name) OR 
                ((o.cpe_brand_model IS NULL OR o.cpe_brand_model = '') AND d.raw_name = ' [MISSING] OLT: ' || COALESCE(o.olt_brand_model, 'Unknown'))
            LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
            LEFT JOIN wifi_routers w ON o.circuit_id = w.circuit_id
            LEFT JOIN wifi_mappings wm ON w.brand = wm.raw_brand AND w.model = wm.raw_model
            LEFT JOIN device_catalog wc ON wm.target_brand = wc.brand AND wm.target_model = wc.model
            LEFT JOIN (SELECT DISTINCT ON (service) * FROM onu_get_olt ORDER BY service, id DESC) gl ON split_part(o.circuit_id, '@', 1) = gl.service
            LEFT JOIN cpe_devices od ON gl.onu_actual_type = od.raw_name
            LEFT JOIN device_catalog oc ON od.brand = oc.brand AND od.model = oc.model
            ${whereClause}
            ORDER BY ${['id', 'created_at'].includes(finalSortField) ? 'o.' : ''}${finalSortField} ${sortOrder}
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*) 
            FROM onu_records o
            LEFT JOIN cpe_devices d ON 
                (o.cpe_brand_model = d.raw_name) OR 
                ((o.cpe_brand_model IS NULL OR o.cpe_brand_model = '') AND d.raw_name = ' [MISSING] OLT: ' || COALESCE(o.olt_brand_model, 'Unknown'))
            LEFT JOIN wifi_routers w ON o.circuit_id = w.circuit_id
            LEFT JOIN wifi_mappings wm ON w.brand = wm.raw_brand AND w.model = wm.raw_model
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
    'type': 'Type',
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
    'wifi_hw_version': 'WiFi Router: Hardware Version',
    'wifi_lan_ge': 'WiFi Router: LAN GE',
    'wifi_lan_fe': 'WiFi Router: LAN FE',
    'wifi_wifi_spec': 'WiFi Router: WiFi Spec',
    'wifi_usage': 'WiFi Router: Usage',
    'wifi_grade': 'WiFi Router: Grade',
    'wifi_price': 'WiFi Router: Price',
    'wifi_max_speed': 'WiFi Router: Max Speed',
    'device_price': 'ราคาอุปกรณ์ (มาตรฐาน)',
    'device_max_speed': 'ความเร็วสูงสุด (Max Speed)'
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
                c.type, c.version, c.lan_ge, c.lan_fe, c.wifi, c.usage, c.grade,
                c.price as device_price, c.max_speed as device_max_speed,
                w.brand as wifi_brand, w.model as wifi_model, w.version as wifi_version,
                wm.target_brand as wifi_mapped_brand, wm.target_model as wifi_mapped_model,
                wc.type as wifi_hw_type, wc.version as wifi_hw_version, wc.lan_ge as wifi_lan_ge, wc.lan_fe as wifi_lan_fe, wc.wifi as wifi_wifi_spec,
                wc.usage as wifi_usage, wc.grade as wifi_grade, wc.price as wifi_price, wc.max_speed as wifi_max_speed
            FROM onu_records o
            LEFT JOIN cpe_devices d ON 
                (o.cpe_brand_model = d.raw_name) OR 
                ((o.cpe_brand_model IS NULL OR o.cpe_brand_model = '') AND d.raw_name = ' [MISSING] OLT: ' || COALESCE(o.olt_brand_model, 'Unknown'))
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

// ============================================================
// NEW DASHBOARD v2 ENDPOINTS (Circuit-Based Summary)
// DO NOT MODIFY ABOVE THIS LINE — Legacy endpoints preserved
// ============================================================

// Helper: parse download speed from "300M / 300M" => 300 (numeric Mbps)
function parseDownloadMbps(speedStr) {
    if (!speedStr) return null;
    const part = speedStr.split('/')[0].trim(); // e.g. "300M" or "1000M"
    const num = parseFloat(part.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return null;
    // handle k (kbps) — very rare
    if (part.toLowerCase().includes('k')) return num / 1000;
    return num;
}

// GET /api/dashboard/service-names
// Returns distinct service_name list for the Card 1.3 dropdown
app.get('/api/dashboard/service-names', authenticate, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT service_name, COUNT(*) as circuit_count
            FROM mv_circuit_summary
            WHERE service_name IS NOT NULL AND service_name != '' AND service_name != 'UNKNOWN'
            GROUP BY service_name
            ORDER BY COUNT(*) DESC
        `);
        res.json({ data: result.rows });
    } catch (err) {
        console.error('Service names error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/dashboard/install-years
// Returns distinct years for the filter
app.get('/api/dashboard/install-years', authenticate, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT install_year
            FROM mv_circuit_summary
            WHERE install_year IS NOT NULL AND install_year != ''
            ORDER BY install_year ASC
        `);
        res.json({ data: result.rows.map(r => r.install_year) });
    } catch (err) {
        console.error('Install years error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/dashboard/stats-v2
// Returns data for 4 new stat cards
app.get('/api/dashboard/stats-v2', authenticate, async (req, res) => {
    const { serviceFilter, startYear, endYear, excludeNoWifi } = req.query; 
    try {
        let yearFilterSql = '';
        const params = [];
        let pIndex = 1;

        if (serviceFilter) {
            params.push(serviceFilter.split(','));
            pIndex++;
        }

        if (startYear && endYear) {
            if (startYear === '0000' || endYear === '0000') {
                yearFilterSql = ` AND install_year = '0000'`;
            } else {
                yearFilterSql = ` AND install_year >= $${pIndex} AND install_year <= $${pIndex + 1}`;
                params.push(startYear, endYear);
                pIndex += 2;
            }
        }

        const serviceFilterSql = serviceFilter ? ` AND service_name = ANY($1::text[])` : '';
        const excludeNoWifiSql = excludeNoWifi === 'true' ? ` AND is_onu_without_wifi = false` : '';
        const combinedFilter = serviceFilterSql + yearFilterSql + excludeNoWifiSql;
        
        const [card11, cards1234] = await Promise.all([
            // Card 1.1: ONU count by type and brand (Still needs Group By)
            pool.query(`
                SELECT COALESCE(NULLIF(onu_device_type, ''), 'Unknown') as type, onu_brand as brand, COUNT(*) as count
                FROM mv_circuit_summary
                WHERE 1=1
                ${combinedFilter}
                GROUP BY COALESCE(NULLIF(onu_device_type, ''), 'Unknown'), onu_brand
                ORDER BY count DESC
            `, params),

            // Cards 1.2, 1.3, 1.4: Combined summary query for efficiency
            pool.query(`
                SELECT 
                    -- Card 1.2 & 1.3 total counts (calculated from FILTER for speed)
                    COUNT(*) FILTER (WHERE is_fe_only AND onu_brand IS NOT NULL) as fe_total,
                    COUNT(*) FILTER (WHERE onu_lan_ge IS NOT NULL AND onu_lan_ge != '' AND onu_lan_ge != '0' AND onu_brand IS NOT NULL) as ge_total,
                    COUNT(*) FILTER (WHERE speed_mbps IS NOT NULL AND effective_max_speed_mbps IS NOT NULL AND has_olt = false AND speed_mbps > effective_max_speed_mbps) as mismatch_total,
                    
                    -- Breakdown for FE (Top 5)
                    (SELECT jsonb_agg(t) FROM (
                        SELECT onu_brand as brand, COUNT(*) as circuit_count
                        FROM mv_circuit_summary
                        WHERE is_fe_only AND onu_brand IS NOT NULL
                        ${combinedFilter}
                        GROUP BY onu_brand ORDER BY circuit_count DESC LIMIT 5
                    ) t) as fe_brands,
                    
                    -- Breakdown for GE (Top 5)
                    (SELECT jsonb_agg(t) FROM (
                        SELECT onu_brand as brand, COUNT(*) as circuit_count
                        FROM mv_circuit_summary
                        WHERE onu_lan_ge IS NOT NULL AND onu_lan_ge != '' AND onu_lan_ge != '0' AND onu_brand IS NOT NULL
                        ${combinedFilter}
                        GROUP BY onu_brand ORDER BY circuit_count DESC LIMIT 5
                    ) t) as ge_brands,
                    
                    -- Breakdown for Mismatch (Top 5)
                    (SELECT jsonb_agg(t) FROM (
                        SELECT onu_brand as brand, COUNT(*) as mismatch_count
                        FROM mv_circuit_summary
                        WHERE speed_mbps IS NOT NULL AND effective_max_speed_mbps IS NOT NULL AND has_olt = false AND speed_mbps > effective_max_speed_mbps
                        ${combinedFilter}
                        GROUP BY onu_brand ORDER BY mismatch_count DESC LIMIT 5
                    ) t) as mismatch_brands
                FROM mv_circuit_summary
                WHERE 1=1
                ${combinedFilter}
            `, params)
        ]);

        const summaryData = cards1234.rows[0];

        // Aggregate card 1.1 by type with top brands
        const typeMap = {};
        for (const row of card11.rows) {
            if (!typeMap[row.type]) typeMap[row.type] = { type: row.type, total: 0, brands: [] };
            typeMap[row.type].total += parseInt(row.count);
            typeMap[row.type].brands.push({ brand: row.brand, count: parseInt(row.count) });
        }
        const typeBreakdown = Object.values(typeMap).map(t => ({
            ...t,
            brands: t.brands.slice(0, 5) // top 5 brands per type
        })).sort((a, b) => b.total - a.total);

        res.json({
            card11_type_breakdown: { brands: typeBreakdown, total: parseInt(card11.rows.reduce((s, r) => s + parseInt(r.count), 0)) },
            card12_fe_only: { brands: summaryData.fe_brands || [], total: parseInt(summaryData.fe_total || 0) },
            card13_ge: { brands: summaryData.ge_brands || [], total: parseInt(summaryData.ge_total || 0) },
            card14_speed_mismatch: { brands: summaryData.mismatch_brands || [], total: parseInt(summaryData.mismatch_total || 0) }
        });
    } catch (err) {
        console.error('Stats v2 error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/dashboard/executive-stats
app.get('/api/dashboard/executive-stats', authenticate, async (req, res) => {
    const { serviceFilter, startYear, endYear, excludeNoWifi } = req.query;
    try {
        let yearFilterSql = '';
        const params = [];
        let pIndex = 1;

        if (serviceFilter) {
            params.push(serviceFilter.split(','));
            pIndex++;
        }

        if (startYear && endYear) {
            if (startYear === '0000' || endYear === '0000') {
                yearFilterSql = ` AND install_year = '0000'`;
            } else {
                yearFilterSql = ` AND install_year >= $${pIndex} AND install_year <= $${pIndex + 1}`;
                params.push(startYear, endYear);
                pIndex += 2;
            }
        }

        const serviceFilterSql = serviceFilter ? ` AND service_name = ANY($1::text[])` : '';
        const excludeNoWifiSql = excludeNoWifi === 'true' ? ` AND is_onu_without_wifi = false` : '';
        const combinedFilter = serviceFilterSql + yearFilterSql + excludeNoWifiSql;

        const result = await pool.query(`
            WITH base AS (
                SELECT 
                    circuit_norm,
                    onu_device_type,
                    onu_wifi_spec,
                    onu_brand,
                    wifi_model,
                    wifi_brand,
                    is_fe_only,
                    speed_mbps,
                    effective_max_speed_mbps,
                    is_onu_without_wifi,
                    CASE 
                        WHEN m.onu_wifi_spec ILIKE '%AX3000%' OR m.onu_wifi_spec ILIKE '%AX6000%' THEN true 
                        ELSE false 
                    END as is_onu_ax,
                    CASE 
                        WHEN dc.wifi ILIKE '%AX3000%' OR dc.wifi ILIKE '%AX6000%' THEN true 
                        ELSE false 
                    END as is_wifi_ax
                FROM mv_circuit_summary m
                LEFT JOIN device_catalog dc ON dc.brand = m.wifi_brand AND dc.model = m.wifi_model
                WHERE 1=1 ${combinedFilter}
            ),
            brand_counts AS (
                SELECT 'total_onu' as category, onu_brand as brand, COUNT(*) as count FROM base WHERE onu_device_type ILIKE '%onu%' GROUP BY onu_brand
                UNION ALL
                SELECT 'total_ap' as category, wifi_brand as brand, COUNT(*) as count FROM base WHERE wifi_brand IS NOT NULL GROUP BY wifi_brand
                UNION ALL
                SELECT 'total_aio' as category, onu_brand as brand, COUNT(*) as count FROM base WHERE onu_device_type ILIKE '%all in one%' GROUP BY onu_brand
                UNION ALL
                SELECT 'total_bridge' as category, onu_brand as brand, COUNT(*) as count FROM base WHERE onu_device_type = 'ONU Bridge' GROUP BY onu_brand
                UNION ALL
                SELECT 'total_fe' as category, onu_brand as brand, COUNT(*) as count FROM base WHERE is_fe_only GROUP BY onu_brand
                UNION ALL
                SELECT 'total_ge' as category, onu_brand as brand, COUNT(*) as count FROM base WHERE NOT is_fe_only AND onu_device_type ILIKE '%onu%' GROUP BY onu_brand
                UNION ALL
                SELECT 'total_ax_3000' as category, COALESCE(wifi_brand, onu_brand) as brand, COUNT(*) as count FROM base WHERE (is_onu_ax OR is_wifi_ax) GROUP BY COALESCE(wifi_brand, onu_brand)
                UNION ALL
                SELECT 'total_below_ax_3000' as category, wifi_brand as brand, COUNT(*) as count FROM base WHERE wifi_brand IS NOT NULL AND NOT (is_onu_ax OR is_wifi_ax) GROUP BY wifi_brand
                UNION ALL
                SELECT 'aio_mismatch' as category, onu_brand as brand, COUNT(*) as count FROM base WHERE speed_mbps > effective_max_speed_mbps AND onu_device_type ILIKE '%all in one%' GROUP BY onu_brand
                UNION ALL
                SELECT 'bridge_mismatch' as category, onu_brand as brand, COUNT(*) as count FROM base WHERE speed_mbps > effective_max_speed_mbps AND onu_device_type = 'ONU Bridge' GROUP BY onu_brand
                UNION ALL
                SELECT 'ap_mismatch' as category, wifi_brand as brand, COUNT(*) as count FROM base WHERE speed_mbps > effective_max_speed_mbps AND wifi_brand IS NOT NULL GROUP BY wifi_brand
            ),
            top_brands AS (
                SELECT 
                    category,
                    jsonb_agg(jsonb_build_object('brand', brand, 'count', count) ORDER BY count DESC) as brands
                FROM (
                    SELECT category, brand, count, ROW_NUMBER() OVER(PARTITION BY category ORDER BY count DESC) as rank
                    FROM brand_counts
                ) s
                WHERE rank <= 5
                GROUP BY category
            )
            SELECT
                COUNT(*) as total_circuits,
                
                -- Inventory
                COUNT(*) FILTER (WHERE onu_device_type ILIKE '%onu%') as total_onu,
                COUNT(*) FILTER (WHERE wifi_model IS NOT NULL) as total_ap,
                COUNT(*) FILTER (WHERE onu_device_type ILIKE '%all in one%') as total_aio,
                COUNT(*) FILTER (WHERE onu_device_type = 'ONU Bridge') as total_bridge,
                
                -- Specs
                COUNT(*) FILTER (WHERE is_fe_only) as total_fe,
                COUNT(*) FILTER (WHERE NOT is_fe_only AND onu_device_type ILIKE '%onu%') as total_ge,
                COUNT(*) FILTER (WHERE (is_onu_ax OR is_wifi_ax)) as total_ax_3000,
                COUNT(*) FILTER (WHERE wifi_brand IS NOT NULL AND NOT (is_onu_ax OR is_wifi_ax)) as total_below_ax_3000,
                
                -- Package/Speed Breakdown (Flow)
                jsonb_build_object(
                    '2000', COUNT(*) FILTER (WHERE speed_mbps >= 2000),
                    '1000', COUNT(*) FILTER (WHERE speed_mbps >= 1000 AND speed_mbps < 2000),
                    '600', COUNT(*) FILTER (WHERE speed_mbps >= 600 AND speed_mbps < 1000),
                    '500', COUNT(*) FILTER (WHERE speed_mbps >= 500 AND speed_mbps < 600),
                    '300', COUNT(*) FILTER (WHERE speed_mbps >= 300 AND speed_mbps < 500),
                    'below_300', COUNT(*) FILTER (WHERE speed_mbps < 300)
                ) as speed_packages,
                
                -- Mismatch Breakdown
                jsonb_build_object(
                    'aio_mismatch', COUNT(*) FILTER (WHERE speed_mbps > effective_max_speed_mbps AND onu_device_type ILIKE '%all in one%'),
                    'bridge_mismatch', COUNT(*) FILTER (WHERE speed_mbps > effective_max_speed_mbps AND onu_device_type = 'ONU Bridge'),
                    'ap_mismatch', COUNT(*) FILTER (WHERE speed_mbps > effective_max_speed_mbps AND wifi_brand IS NOT NULL)
                ) as mismatch_stats,

                -- Top Brands Mapping
                (SELECT jsonb_object_agg(category, brands) FROM top_brands) as brand_breakdown
                
            FROM base
        `, params);

        res.json({ data: result.rows[0] });
    } catch (err) {
        console.error('Executive stats error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/dashboard/circuit-summary
// Main table: joins all 3 tables by normalized circuit_id
app.get('/api/dashboard/circuit-summary', authenticate, async (req, res) => {
    const { search = '', page = 1, limit = 50, sortField = 'circuit_norm', sortOrder = 'ASC', serviceFilter = '', startYear = '', endYear = '', excludeNoWifi } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchPattern = `%${search}%`;

    const validSorts = ['circuit_norm', 'speed', 'service_name', 'install_year', 'onu_brand', 'olt_brand', 'wifi_brand', 'effective_max_speed'];
    const finalSort = validSorts.includes(sortField) ? sortField : 'circuit_norm';
    const finalOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sortSql = `f.${finalSort}`;
    if (finalSort === 'speed') {
        sortSql = `f.speed_mbps`;
    } else if (finalSort === 'effective_max_speed') {
        sortSql = `f.effective_max_speed_mbps`;
    }

    try {
        let whereClauses = ['1=1'];
        const params = [];
        let pIndex = 1;

        if (search) {
            whereClauses.push(`(f.circuit_norm ILIKE $${pIndex} OR f.speed ILIKE $${pIndex} OR f.onu_brand ILIKE $${pIndex} OR f.olt_brand ILIKE $${pIndex} OR f.wifi_brand ILIKE $${pIndex} OR f.service_name ILIKE $${pIndex})`);
            params.push(searchPattern);
            pIndex++;
        }

        if (serviceFilter) {
            whereClauses.push(`f.service_name = ANY($${pIndex}::text[])`);
            params.push(serviceFilter.split(','));
            pIndex++;
        }

        if (startYear && endYear) {
            if (startYear === '0000' || endYear === '0000') {
                whereClauses.push(`f.install_year = '0000'`);
            } else {
                whereClauses.push(`f.install_year >= $${pIndex} AND f.install_year <= $${pIndex + 1}`);
                params.push(startYear, endYear);
                pIndex += 2;
            }
        }

        if (excludeNoWifi === 'true') {
            whereClauses.push(`f.is_onu_without_wifi = false`);
        }

        const finalWhereClause = `WHERE ${whereClauses.join(' AND ')}`;
        const queryText = `
            SELECT f.*, count(*) OVER() as full_count FROM mv_circuit_summary f
            ${finalWhereClause}
            ORDER BY ${sortSql} ${finalOrder} NULLS LAST
            LIMIT $${pIndex} OFFSET $${pIndex + 1}
        `;
        const dataParams = [...params, parseInt(limit), offset];

        const result = await pool.query(queryText, dataParams);

        const rows = result.rows;
        
        let total = 0;
        if (rows.length > 0) {
            total = parseInt(rows[0].full_count);
            // remove full_count from each row so it doesn't pollute the data
            rows.forEach(r => delete r.full_count);
        }

        res.json({
            data: rows,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error('Circuit summary error:', err);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/dashboard/circuit-summary/export', authenticate, async (req, res) => {
    const { search = '', sortField = 'circuit_norm', sortOrder = 'ASC', serviceFilter = '', startYear = '', endYear = '', excludeNoWifi } = req.query;
    const searchPattern = `%${search}%`;
    const validSorts = ['circuit_norm', 'speed', 'service_name', 'install_year', 'onu_brand', 'olt_brand', 'wifi_brand', 'effective_max_speed'];
    const finalSort = validSorts.includes(sortField) ? sortField : 'circuit_norm';
    const finalOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    let sortSql = `f.${finalSort}`;
    if (finalSort === 'speed') {
        sortSql = `CASE 
            WHEN COALESCE(CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(f.speed, '/', 1), '[^0-9.]', '', 'g'), '') AS numeric), 0) > 5000 THEN 
                COALESCE(CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(f.speed, '/', 1), '[^0-9.]', '', 'g'), '') AS numeric), 0) / 1024
            WHEN SPLIT_PART(f.speed, '/', 1) ILIKE '%k%' THEN 
                COALESCE(CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(f.speed, '/', 1), '[^0-9.]', '', 'g'), '') AS numeric), 0) / 1024
            ELSE 
                COALESCE(CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(f.speed, '/', 1), '[^0-9.]', '', 'g'), '') AS numeric), 0)
        END`;
    } else if (finalSort === 'effective_max_speed') {
    }


    try {
        let whereClauses = ['1=1'];
        const params = [];
        let pIndex = 1;

        if (search) {
            whereClauses.push(`(f.circuit_norm ILIKE $${pIndex} OR f.speed ILIKE $${pIndex} OR f.onu_brand ILIKE $${pIndex} OR f.olt_brand ILIKE $${pIndex} OR f.wifi_brand ILIKE $${pIndex} OR f.service_name ILIKE $${pIndex})`);
            params.push(searchPattern);
            pIndex++;
        }

        if (serviceFilter) {
            whereClauses.push(`f.service_name = ANY($${pIndex}::text[])`);
            params.push(serviceFilter.split(','));
            pIndex++;
        }

        if (startYear && endYear) {
            if (startYear === '0000' || endYear === '0000') {
                whereClauses.push(`f.install_year = '0000'`);
            } else {
                whereClauses.push(`f.install_year >= $${pIndex} AND f.install_year <= $${pIndex + 1}`);
                params.push(startYear, endYear);
                pIndex += 2;
            }
        }

        if (excludeNoWifi === 'true') {
            whereClauses.push(`f.is_onu_without_wifi = false`);
        }

        const finalWhereClause = `WHERE ${whereClauses.join(' AND ')}`;

        const queryText = `
            SELECT 
                f.circuit_norm as "หมายเลขวงจร", 
                f.speed as "ความเร็ว (Raw)",
                CASE 
                    WHEN CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(f.speed, '/', 1), '[^0-9.]', '', 'g'), '') AS NUMERIC) > 5000 THEN 
                        CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(f.speed, '/', 1), '[^0-9.]', '', 'g'), '') AS NUMERIC) / 1024
                    WHEN SPLIT_PART(f.speed, '/', 1) ILIKE '%k%' THEN 
                        CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(f.speed, '/', 1), '[^0-9.]', '', 'g'), '') AS NUMERIC) / 1024
                    ELSE 
                        CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(f.speed, '/', 1), '[^0-9.]', '', 'g'), '') AS NUMERIC)
                END as "ความเร็ว (Download Mbps)",
                f.service_name as "Service Name",
                f.install_year as "ปีที่ติดตั้ง",
                f.onu_raw_name as "ONU Device (Raw Name)",
                f.onu_brand as "ONU Brand",
                f.onu_model as "ONU Model",
                f.onu_device_type as "ONU Type",
                f.onu_lan_ge as "ONU Port GE",
                f.onu_lan_fe as "ONU Port FE",
                f.olt_brand as "OLT Brand",
                f.olt_model as "OLT Model",
                f.wifi_brand as "WiFi Router Brand", 
                f.wifi_model as "WiFi Router Model",
                f.effective_max_speed as "Max Speed รวม (Mbps)",
                CASE WHEN f.is_onu_without_wifi THEN 'ใช่' ELSE 'ไม่' END as "ไม่มี WiFi ต่อพ่วง"
            FROM mv_circuit_summary f
            ${finalWhereClause}
            ORDER BY ${sortSql} ${finalOrder} NULLS LAST
        `;

        const result = await pool.query(queryText, params);
        const worksheet = XLSX.utils.json_to_sheet(result.rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Circuit Summary");
        const fileName = `circuit_summary_${Date.now()}.xlsx`;
        const filePath = `uploads/${fileName}`;
        XLSX.writeFile(workbook, filePath);
        res.download(filePath, fileName, (err) => { if (!err) fs.unlinkSync(filePath); });
    } catch (err) { res.status(500).json({ message: 'Export failed: ' + err.message }); }
});

// GET /api/dashboard/no-wifi-summary
app.get('/api/dashboard/no-wifi-summary', authenticate, async (req, res) => {
    const threshold = parseInt(req.query.threshold) || 500;
    try {
        const result = await pool.query(`
            SELECT 
                onu_brand,
                onu_model,
                onu_device_type,
                is_onu_without_wifi,
                wifi_brand,
                wifi_model,
                effective_max_speed_mbps as eff_speed,
                speed_mbps as pkg_speed,
                is_fe_only,
                COUNT(DISTINCT circuit_norm) as circuit_count
            FROM mv_circuit_summary
            GROUP BY 
                onu_brand, 
                onu_model,
                onu_device_type,
                is_onu_without_wifi,
                wifi_brand,
                wifi_model,
                effective_max_speed_mbps,
                speed_mbps,
                is_fe_only
        `);

        const feOnlyGroup = {};   // Group 1
        const outdatedAPGroup = {}; // Group 2
        const mismatchGroup = {};  // Group 2.1 (WiFi Router)
        const overallMismatchGroup = {}; // Group 2.2 (Overall - Focus on ONU)
        const noWifiGroup = {};    // Group 3

        for (const row of result.rows) {
            const { onu_brand, onu_model, onu_device_type, is_onu_without_wifi, wifi_brand, wifi_model, eff_speed, pkg_speed, is_fe_only, circuit_count } = row;
            const count = parseInt(circuit_count);
            const effSpeed = parseFloat(eff_speed) || 0;
            const pkgSpeed = parseFloat(pkg_speed) || 0;

            // Group 1: All FE Only (Regardless of wifi attachment, but only for ONU)
            const isOnu = (onu_device_type || '').toLowerCase().includes('onu');
            if (is_fe_only && isOnu) {
                const brand = onu_brand || 'Pending Mapping';
                const model = onu_model || 'Raw Data';
                if (!feOnlyGroup[brand]) feOnlyGroup[brand] = { brand, total: 0, models: [] };
                feOnlyGroup[brand].total += count;
                let existing = feOnlyGroup[brand].models.find(m => m.model === model);
                if (!existing) {
                    existing = { model, bridge_count: 0, aio_count: 0 };
                    feOnlyGroup[brand].models.push(existing);
                }
                if ((onu_device_type || '').toLowerCase().includes('all in one')) {
                    existing.aio_count += count;
                } else {
                    existing.bridge_count += count;
                }
            }

            // Group 2: Outdated AP (WiFi Router with speed <= threshold)
            if (wifi_brand && wifi_model && !is_fe_only) {
                if (effSpeed > 0 && effSpeed <= threshold) {
                    const brand = wifi_brand || 'Unknown';
                    const model = wifi_model || 'Unknown';
                    if (!outdatedAPGroup[brand]) outdatedAPGroup[brand] = { brand, total: 0, models: [] };
                    outdatedAPGroup[brand].total += count;
                    const existing = outdatedAPGroup[brand].models.find(m => m.model === model);
                    if (existing) existing.count += count;
                    else outdatedAPGroup[brand].models.push({ model, count });
                }
            }

            // Group 2.1: Speed Mismatch (Package > Device Max) - Focus on non-ONU (WiFi Routers)
            if (pkgSpeed > effSpeed && wifi_brand && wifi_model) {
                const brand = wifi_brand || 'Unknown';
                const model = wifi_model || 'Unknown';
                const pkgKey = Math.round(pkgSpeed).toString(); // e.g. "1000", "600"
                
                if (!mismatchGroup[brand]) mismatchGroup[brand] = { brand, total: 0, models: [] };
                mismatchGroup[brand].total += count;
                
                let existing = mismatchGroup[brand].models.find(m => m.model === model);
                if (!existing) {
                    existing = { model, count: 0, speeds: {}, max_speed: effSpeed };
                    mismatchGroup[brand].models.push(existing);
                }
                existing.count += count;
                existing.speeds[pkgKey] = (existing.speeds[pkgKey] || 0) + count;
            }

            // Group 2.2: Overall Speed Mismatch (pkg > device_max) - Focus on ONU
            const dlStr = row.speed ? row.speed.split('/')[0] : '';
            const rawVal = parseFloat(dlStr.replace(/[^0-9.]/g, '')) || 0;
            let pkgSpeedOverall = 0;
            if (rawVal > 0) {
              if (dlStr.toLowerCase().includes('k') || rawVal > 5000) {
                pkgSpeedOverall = rawVal / 1024;
              } else {
                pkgSpeedOverall = rawVal;
              }
            }
            const deviceMax = parseInt(row.effective_max_speed) || 0;
            const isMismatch = pkgSpeedOverall > deviceMax && deviceMax > 0;
            if (isMismatch) {
                const brand = onu_brand || 'Unknown';
                const model = onu_model || 'Unknown';
                const pkgKey = Math.round(pkgSpeedOverall).toString();
                
                if (!overallMismatchGroup[brand]) overallMismatchGroup[brand] = { brand, total: 0, models: [] };
                overallMismatchGroup[brand].total += count;
                
                let existing = overallMismatchGroup[brand].models.find(m => m.model === model);
                if (!existing) {
                    existing = { model, count: 0, speeds: {}, max_speed: effSpeed, type: onu_device_type };
                    overallMismatchGroup[brand].models.push(existing);
                }
                existing.count += count;
                existing.speeds[pkgKey] = (existing.speeds[pkgKey] || 0) + count;
            }

            // Group 3: ONU Bridge with GE port and No WiFi
            if (onu_device_type === 'ONU Bridge' && is_onu_without_wifi) {
                const brand = onu_brand || 'Pending Mapping';
                const model = onu_model || 'Raw Data';
                if (!noWifiGroup[brand]) noWifiGroup[brand] = { brand, total: 0, models: [] };
                noWifiGroup[brand].total += count;
                const existing = noWifiGroup[brand].models.find(m => m.model === model);
                if (existing) existing.count += count;
                else noWifiGroup[brand].models.push({ model, count });
            }
        }
        
        const sortGroup = (groupMap, isGroup1 = false) => {
            return Object.values(groupMap)
                .sort((a, b) => b.total - a.total)
                .map(b => {
                    if (isGroup1) {
                        b.models.sort((x, y) => (y.bridge_count + y.aio_count) - (x.bridge_count + x.aio_count));
                    } else {
                        b.models.sort((x, y) => y.count - x.count);
                    }
                    return b;
                });
        };

        const noWifiGrandTotal = Object.values(noWifiGroup).reduce((s, b) => s + b.total, 0);
        const feOnlyGrandTotal = Object.values(feOnlyGroup).reduce((s, b) => s + b.total, 0);
        const outdatedAPGrandTotal = Object.values(outdatedAPGroup).reduce((s, b) => s + b.total, 0);
        const mismatchGrandTotal = Object.values(mismatchGroup).reduce((s, b) => s + b.total, 0);
        const overallMismatchGrandTotal = Object.values(overallMismatchGroup).reduce((s, b) => s + b.total, 0);

        res.json({ 
            data: {
                no_wifi: sortGroup(noWifiGroup),
                fe_only: sortGroup(feOnlyGroup, true),
                outdated_ap: sortGroup(outdatedAPGroup),
                speed_mismatch: sortGroup(mismatchGroup),
                overall_mismatch: sortGroup(overallMismatchGroup),
                no_wifi_total: noWifiGrandTotal,
                fe_only_total: feOnlyGrandTotal,
                outdated_ap_total: outdatedAPGrandTotal,
                speed_mismatch_total: mismatchGrandTotal,
                overall_mismatch_total: overallMismatchGrandTotal
            } 
        });
    } catch (err) {
        console.error('No WiFi summary error:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/dashboard/refresh-view
// Force refresh the materialized view
app.post('/api/dashboard/refresh-view', authenticate, async (req, res) => {
    try {
        await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_circuit_summary');
        res.json({ message: 'Materialized view refreshed successfully' });
    } catch (err) {
        console.error('Refresh view error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ============================================================
// REPLACEMENT EQUIPMENT MANAGEMENT
// ============================================================

// GET /api/replacement-configs
app.get('/api/replacement-configs', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM replacement_configs ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/replacement-configs
app.post('/api/replacement-configs', authenticate, async (req, res) => {
    const { brand, model, type, price } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO replacement_configs (brand, model, type, price) VALUES ($1, $2, $3, $4) RETURNING *',
            [brand, model, type, price]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/replacement-configs/:id
app.put('/api/replacement-configs/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { brand, model, type, price } = req.body;
    try {
        const result = await pool.query(
            'UPDATE replacement_configs SET brand=$1, model=$2, type=$3, price=$4, updated_at=CURRENT_TIMESTAMP WHERE id=$5 RETURNING *',
            [brand, model, type, price, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/replacement-configs/:id
app.delete('/api/replacement-configs/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM replacement_configs WHERE id=$1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================================
// END DASHBOARD v2 & REPLACEMENT ENDPOINTS
// ============================================================

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

