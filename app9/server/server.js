const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const multer = require('multer');
const xlsx = require('xlsx');
const ExcelJS = require('exceljs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3009;

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is not set. In production mode, this is highly insecure!');
}
const JWT_SECRET = process.env.JWT_SECRET || 'app9_super_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// DB Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@nexus-app9-db:5432/app9_db'
});

// Init Default Admin if not exists
async function initAdmin() {
  try {
    const res = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (res.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await pool.query('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)', ['admin', hash, 'admin']);
      console.log('Default admin user created (admin / admin123)');
    }
  } catch (err) {
    console.error('Error initializing admin user:', err);
  }
}
initAdmin();

// Database Migration for Multi-Master (JSONB Approach)
async function runMigrations() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS master_datasets (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          dataset_name VARCHAR(255) NOT NULL,
          primary_key_column VARCHAR(100) NOT NULL,
          schema_config JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS master_data_records (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          dataset_id UUID REFERENCES master_datasets(id) ON DELETE CASCADE,
          primary_key_value VARCHAR(255) NOT NULL,
          data JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(dataset_id, primary_key_value)
      );
    `);
    // Alter survey_projects to link to master_datasets
    await pool.query(`
      ALTER TABLE survey_projects 
      ADD COLUMN IF NOT EXISTS master_dataset_id UUID REFERENCES master_datasets(id) ON DELETE SET NULL;
    `);
    console.log('Multi-Master JSONB Migrations completed successfully.');
  } catch (err) {
    console.error('Multi-Master Database migration failed:', err);
  }
}
runMigrations();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Setup Multer
const upload = multer({ dest: 'uploads/' });

// --- API ENDPOINTS ---

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (Admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    const result = await pool.query('SELECT id, username, role FROM users ORDER BY username ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user (Admin only)
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: 'Missing required fields' });

    const checkUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (checkUser.rows.length > 0) return res.status(400).json({ error: 'Username already exists' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hash, role]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (Admin only)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    const { id } = req.params;
    const { username, password, role } = req.body;
    if (!username || !role) return res.status(400).json({ error: 'Username and role are required' });

    const checkUser = await pool.query('SELECT * FROM users WHERE username = $1 AND id != $2', [username, id]);
    if (checkUser.rows.length > 0) return res.status(400).json({ error: 'Username already exists' });

    let query = 'UPDATE users SET username = $1, role = $2';
    const params = [username, role];

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query += ', password_hash = $3 WHERE id = $4';
      params.push(hash, id);
    } else {
      query += ' WHERE id = $3';
      params.push(id);
    }

    await pool.query(query, params);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (Admin only)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    const checkUser = await pool.query('SELECT username FROM users WHERE id = $1', [id]);
    if (checkUser.rows.length > 0 && checkUser.rows[0].username === 'admin') {
      return res.status(400).json({ error: 'Cannot delete the default admin account' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Excel and Generate Project
app.post('/api/parse-survey-excel', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Clean up temporary file immediately after reading
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting temp survey file:', err);
    });

    if (data.length === 0) return res.status(400).json({ error: 'Empty excel file' });

    const headers = Object.keys(data[0]);
    const ipKey = headers.find(h => h.toLowerCase().includes('ip')) || headers[0];
    const otherHeaders = headers.filter(h => h !== ipKey);

    res.json({ headers: otherHeaders, ipKey, data });
  } catch (error) {
    console.error(error);
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-survey-project', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });

    const { projectName, displayMode, masterDatasetId, formSchema, data, ipKey } = req.body;
    if (!projectName || !formSchema || !data || !ipKey) return res.status(400).json({ error: 'Missing required fields' });

    // Create Project
    const projRes = await pool.query(
      'INSERT INTO survey_projects (project_name, form_schema, display_mode, master_dataset_id) VALUES ($1, $2, $3, $4) RETURNING project_id',
      [projectName, JSON.stringify(formSchema), displayMode || 'form', masterDatasetId || null]
    );
    const projectId = projRes.rows[0].project_id;

    // Insert missing sites and create tasks
    for (const row of data) {
      const ip = String(row[ipKey]).trim();
      if (!ip) continue;
      
      await pool.query(
        'INSERT INTO sites (ip_address, site_name) VALUES ($1, $2) ON CONFLICT (ip_address) DO NOTHING',
        [ip, `Site ${ip}`]
      );
      
      await pool.query(
        'INSERT INTO survey_tasks (project_id, ip_address, survey_data) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [projectId, ip, JSON.stringify(row)]
      );
    }

    res.json({ message: 'Project created successfully', projectId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const uploadJobs = {};

// Shared header mapping for OLT file columns
const OLT_HEADER_MAP = {
  'NO': 'no', 'Operator': 'operator', 'Node_Status': 'node_status', 'Life': 'life',
  'Asset': 'asset', 'Province': 'province', 'Service_Center': 'service_center',
  'ServiceCenter': 'service_center', 'Brand': 'brand', 'NE_IP': 'ne_ip',
  'IP Address': 'ne_ip', 'NE_Name': 'ne_name', 'NE_Type': 'ne_type',
  'Bandwidth': 'bandwidth', 'Used_Port': 'used_port', 'Free_Port': 'free_port',
  'Total': 'total', 'Battery_life': 'battery_life', 'Type': 'type',
  'PON_Type': 'pon_type', 'OLT_Slot': 'olt_slot', 'Platform': 'platform',
  'Name_Umbo': 'name_umbo', 'customer_Umbo': 'customer_umbo', 'OLT_Twin': 'olt_twin',
  'Procurement_OLT': 'procurement_olt', 'Procurement_Battery_Li_On': 'procurement_battery_li_on',
  'Battery_Site': 'battery_site', 'Asset_Battery': 'asset_battery', 'Check_Update_OLT': 'check_update_olt',
  'ID': 'umbo_id', 'LocationName': 'umbo_location_name', 'Latitude': 'latitude', 'Longitude': 'longitude',
  // Thai Headers
  'ที่': 'no', 'ที่ตั้ง OLT': 'ne_name', 'PON เปิดใช้': 'used_port', 'PON ว่าง': 'free_port',
  'จังหวัด': 'province', 'โครงข่าย': 'operator', 'ยี่ห้อ': 'brand', 'รุ่น': 'ne_type'
};

// Preview OLT Upload - parse file and check for new/duplicate IPs
app.post('/api/preview-olt-upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.readFile(req.file.path, { codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    // Clean up temp file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting temp preview file:', err);
    });

    if (data.length === 0) return res.status(400).json({ error: 'Empty file' });

    // Map file headers to DB columns
    const fileHeaders = Object.keys(data[0]);
    const dbColumns = [];
    const fileKeys = [];
    for (const h of fileHeaders) {
      const dbCol = OLT_HEADER_MAP[h];
      if (dbCol) { dbColumns.push(dbCol); fileKeys.push(h); }
    }

    if (!dbColumns.includes('ne_ip')) {
      return res.status(400).json({ error: 'File must contain NE_IP or IP Address column' });
    }

    const ne_ip_index = dbColumns.indexOf('ne_ip');
    const ipFileKey = fileKeys[ne_ip_index];

    // Extract all valid IPs from file
    const fileIPs = [];
    for (const row of data) {
      const ip = String(row[ipFileKey] || '').trim();
      if (ip && ip !== 'undefined') fileIPs.push(ip);
    }

    // Check which IPs already exist in DB
    let existingIPs = new Set();
    if (fileIPs.length > 0) {
      const result = await pool.query(
        'SELECT ne_ip FROM olt_base_data WHERE ne_ip = ANY($1)',
        [fileIPs]
      );
      existingIPs = new Set(result.rows.map(r => r.ne_ip));
    }

    // Categorize rows
    const newRows = [];
    const duplicateRows = [];
    const skippedCount = data.length - fileIPs.length;

    for (const row of data) {
      const ip = String(row[ipFileKey] || '').trim();
      if (!ip || ip === 'undefined') continue;

      // Build a simplified display object
      const displayRow = {};
      for (let i = 0; i < fileKeys.length; i++) {
        displayRow[dbColumns[i]] = String(row[fileKeys[i]] || '').trim();
      }

      if (existingIPs.has(ip)) {
        duplicateRows.push(displayRow);
      } else {
        newRows.push(displayRow);
      }
    }

    res.json({
      totalRows: data.length,
      validRows: fileIPs.length,
      skippedRows: skippedCount,
      newCount: newRows.length,
      duplicateCount: duplicateRows.length,
      newSamples: newRows.slice(0, 5),
      duplicateSamples: duplicateRows.slice(0, 5),
      matchedColumns: dbColumns,
      unmatchedHeaders: fileHeaders.filter(h => !OLT_HEADER_MAP[h])
    });
  } catch (error) {
    console.error(error);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: error.message });
  }
});

async function processOltUpload(filePath, jobId) {
  try {
    const workbook = xlsx.readFile(filePath, { codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    // Clean up temporary file immediately after reading/parsing
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temp OLT upload file:', err);
    });

    if (data.length === 0) {
      uploadJobs[jobId] = { status: 'error', message: 'Empty file' };
      return;
    }

    const fileHeaders = Object.keys(data[0]);
    const dbColumns = [];
    const fileKeys = [];

    for (const h of fileHeaders) {
      const dbCol = OLT_HEADER_MAP[h];
      if (dbCol) {
        dbColumns.push(dbCol);
        fileKeys.push(h);
      }
    }

    if (!dbColumns.includes('ne_ip')) {
      uploadJobs[jobId] = { status: 'error', message: 'File must contain NE_IP or IP Address column' };
      return;
    }

    uploadJobs[jobId].total = data.length;
    uploadJobs[jobId].status = 'processing';
    uploadJobs[jobId].message = 'Inserting data...';

    // Build Dynamic Query
    const placeholders = dbColumns.map((_, i) => `$${i + 1}`).join(', ');
    const updateClauses = dbColumns
      .filter(col => col !== 'ne_ip')
      .map(col => `${col} = EXCLUDED.${col}`)
      .join(', ');

    const query = updateClauses.length > 0 
      ? `
          INSERT INTO olt_base_data (${dbColumns.join(', ')}) 
          VALUES (${placeholders}) 
          ON CONFLICT (ne_ip) DO UPDATE SET 
          ${updateClauses}
        `
      : `
          INSERT INTO olt_base_data (${dbColumns.join(', ')}) 
          VALUES (${placeholders}) 
          ON CONFLICT (ne_ip) DO NOTHING
        `;

    let count = 0;
    for (const row of data) {
      const ne_ip_index = dbColumns.indexOf('ne_ip');
      const ne_ip = String(row[fileKeys[ne_ip_index]]).trim();
      
      if (!ne_ip || ne_ip === 'undefined') {
        count++;
        uploadJobs[jobId].progress = count;
        continue;
      }

      const values = fileKeys.map(k => String(row[k] || '').trim());

      await pool.query(query, values);
      count++;
      
      if (count % 50 === 0 || count === data.length) {
        uploadJobs[jobId].progress = count;
      }
    }

    uploadJobs[jobId].status = 'completed';
    uploadJobs[jobId].message = `Successfully processed ${count} records.`;
  } catch (error) {
    console.error('Job Error:', error);
    fs.unlink(filePath, () => {}); // ensure file is deleted on error
    uploadJobs[jobId] = { status: 'error', message: error.message };
  }
}

// Admin: Upload OLT Base Data
app.post('/api/upload-olt-base', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const jobId = Date.now().toString();
    uploadJobs[jobId] = { progress: 0, total: 100, status: 'starting', message: 'Reading file...' };

    // Run in background
    processOltUpload(req.file.path, jobId);

    res.json({ jobId, message: 'Upload started' });
  } catch (error) {
    console.error(error);
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/upload-progress/:jobId', authenticateToken, (req, res) => {
  const job = uploadJobs[req.params.jobId];
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// Admin: Get OLT Data
app.get('/api/olt-base', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    const { search = '', page = 1, limit = 50, sortField = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    const validSortFields = ['ne_ip', 'ne_name', 'province', 'operator', 'created_at'];
    const safeSortField = validSortFields.includes(sortField) ? sortField : 'created_at';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    let query = 'SELECT * FROM olt_base_data';
    const params = [];
    
    if (search) {
      query += ' WHERE ne_ip ILIKE $1 OR ne_name ILIKE $1 OR province ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY ${safeSortField} ${safeSortOrder} NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM olt_base_data';
    const countParams = [];
    if (search) {
      countQuery += ' WHERE ne_ip ILIKE $1 OR ne_name ILIKE $1 OR province ILIKE $1';
      countParams.push(`%${search}%`);
    }
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete OLT Data
app.delete('/api/olt-base/:ne_ip', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    const { ne_ip } = req.params;
    await pool.query('DELETE FROM olt_base_data WHERE ne_ip = $1', [ne_ip]);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Allowed columns in olt_base_data table to prevent SQL injection through dynamic updates
const ALLOWED_OLT_COLUMNS = new Set([
  'no', 'operator', 'node_status', 'life', 'asset', 'province', 'service_center',
  'brand', 'ne_name', 'ne_type', 'bandwidth', 'used_port', 'free_port', 'total',
  'battery_life', 'type', 'pon_type', 'olt_slot', 'platform', 'name_umbo',
  'customer_umbo', 'olt_twin', 'procurement_olt', 'procurement_battery_li_on',
  'battery_site', 'asset_battery', 'umbo_id', 'umbo_location_name', 'latitude',
  'longitude', 'asset_code'
]);

// Admin: Edit OLT Data
app.put('/api/olt-base/:ne_ip', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    const { ne_ip } = req.params;
    const body = req.body;
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let i = 1;
    for (const [key, value] of Object.entries(body)) {
      if (key === 'ne_ip' || key === 'created_at') continue;
      
      // Safety check to prevent SQL injection via keys
      if (!ALLOWED_OLT_COLUMNS.has(key)) {
        return res.status(400).json({ error: `Invalid column name: ${key}` });
      }
      
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
    
    if (fields.length === 0) return res.json({ message: 'No fields to update' });
    
    values.push(ne_ip);
    const query = `UPDATE olt_base_data SET ${fields.join(', ')} WHERE ne_ip = $${i}`;
    
    await pool.query(query, values);
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, m.dataset_name as master_dataset_name 
      FROM survey_projects p 
      LEFT JOIN master_datasets m ON p.master_dataset_id = m.id 
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id/schema', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    const { id } = req.params;
    const { formSchema, displayMode } = req.body;
    
    await pool.query(
      'UPDATE survey_projects SET form_schema = $1, display_mode = $2 WHERE project_id = $3',
      [JSON.stringify(formSchema), displayMode, id]
    );
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    const { id } = req.params;
    
    // First delete all survey tasks for this project
    await pool.query('DELETE FROM survey_tasks WHERE project_id = $1', [id]);
    
    // Then delete the project
    await pool.query('DELETE FROM survey_projects WHERE project_id = $1', [id]);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Export Project to Excel
app.get('/api/projects/:id/export', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const projectRes = await pool.query('SELECT * FROM survey_projects WHERE project_id = $1', [id]);
    if (projectRes.rows.length === 0) return res.status(404).send('Project not found');
    const project = projectRes.rows[0];

    const tasksRes = await pool.query('SELECT * FROM survey_tasks WHERE project_id = $1 ORDER BY task_id ASC', [id]);
    const tasks = tasksRes.rows;

    const data = tasks.map(t => {
      return {
        'IP Address': t.ip_address,
        'NE Name': t.ne_name || t.site_name,
        'Status': t.status,
        ...(t.survey_data || {})
      };
    });

    if (data.length === 0) return res.status(400).send('No data to export');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('SurveyData');

    // Collect all unique keys from all rows to ensure consistent columns
    const allKeysSet = new Set();
    data.forEach(row => {
      Object.keys(row).forEach(k => allKeysSet.add(k));
    });
    const allKeys = Array.from(allKeysSet);

    const columns = allKeys.map(k => ({ name: k, filterButton: true }));
    const rows = data.map(row => allKeys.map(k => {
      const v = row[k];
      if (v !== null && v !== undefined) {
        if (typeof v === 'string' && v.startsWith('data:image/')) {
          return '[Image Uploaded]';
        }
        if (typeof v === 'object' && v !== null && v.name && v.data) {
          return `[File: ${v.name}]`;
        }
        return String(v);
      }
      return '';
    }));

    sheet.addTable({
      name: 'SurveyTable',
      ref: 'A1',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleMedium2', // This gives alternating colors (blue)
        showRowStripes: true,
      },
      columns: columns,
      rows: rows
    });

    // Auto-fit columns
    sheet.columns.forEach(column => {
      column.width = 25;
    });

    res.setHeader('Content-Disposition', `attachment; filename="Survey_${project.project_name.replace(/[^a-z0-9]/gi, '_')}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM survey_projects WHERE project_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:id/tasks', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, s.site_name, s.location, 
              m.data->>'province' AS province, 
              m.data->>'ne_name' AS ne_name, 
              m.data->>'brand' AS brand,
              m.data AS master_data
       FROM survey_tasks t
       JOIN sites s ON t.ip_address = s.ip_address
       JOIN survey_projects p ON t.project_id = p.project_id
       LEFT JOIN master_data_records m ON t.ip_address = m.primary_key_value AND m.dataset_id = p.master_dataset_id
       WHERE t.project_id = $1
       ORDER BY t.task_id ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sites-lookup', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT primary_key_value AS ip_address, 
              data->>'ne_name' AS site_name, 
              data->>'province' AS province, 
              data->>'brand' AS brand 
       FROM master_data_records
       ORDER BY primary_key_value ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:id/change-site', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { target_ip_address, current_survey_data, current_status } = req.body;

    if (!target_ip_address) {
      return res.status(400).json({ error: 'Target IP Address is required' });
    }

    await client.query('BEGIN');

    // Ensure target site exists in sites table
    await client.query(
      'INSERT INTO sites (ip_address, site_name) VALUES ($1, $2) ON CONFLICT (ip_address) DO NOTHING',
      [target_ip_address, `Site ${target_ip_address}`]
    );

    // 1. Fetch current task
    const currentTaskRes = await client.query('SELECT * FROM survey_tasks WHERE task_id = $1', [id]);
    if (currentTaskRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Current task not found' });
    }
    const currentTask = currentTaskRes.rows[0];

    // Record relocation history
    const prevIp = currentTask.ip_address;
    const historyEntry = `ย้ายมาจาก IP: ${prevIp} เมื่อ ${new Date().toLocaleString('th-TH')}`;
    const updatedSurveyData = { ...current_survey_data };
    
    // Maintain the original/starting IP as 'ย้ายมาจาก IP' if it's already set
    if (!updatedSurveyData['ย้ายมาจาก IP']) {
      updatedSurveyData['ย้ายมาจาก IP'] = prevIp;
    }
    
    const existingHistory = updatedSurveyData['ประวัติการย้ายไซต์'] || '';
    updatedSurveyData['ประวัติการย้ายไซต์'] = existingHistory 
      ? `${existingHistory} | ${historyEntry}`
      : historyEntry;

    // 2. Check if a task with target_ip_address exists in the same project
    const targetTaskRes = await client.query(
      'SELECT * FROM survey_tasks WHERE project_id = $1 AND ip_address = $2',
      [currentTask.project_id, target_ip_address]
    );

    if (targetTaskRes.rows.length > 0) {
      const targetTask = targetTaskRes.rows[0];
      // Case 2: Target task exists, swap survey data and status
      await client.query(
        'UPDATE survey_tasks SET survey_data = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE task_id = $3',
        [JSON.stringify(updatedSurveyData), current_status || 'Completed', targetTask.task_id]
      );
      await client.query(
        'UPDATE survey_tasks SET survey_data = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE task_id = $3',
        [JSON.stringify(targetTask.survey_data || {}), targetTask.status || 'Pending', currentTask.task_id]
      );
    } else {
      // Case 1: Target task does not exist, update IP directly
      await client.query(
        'UPDATE survey_tasks SET ip_address = $1, survey_data = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE task_id = $4',
        [target_ip_address, JSON.stringify(updatedSurveyData), current_status || 'Completed', id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Site changed successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.post('/api/tasks/:id/revert-site', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    // Fetch current task
    const taskRes = await client.query('SELECT * FROM survey_tasks WHERE task_id = $1', [id]);
    if (taskRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Task not found' });
    }
    const currentTask = taskRes.rows[0];
    const originalIp = currentTask.survey_data?.['ย้ายมาจาก IP'];

    if (!originalIp) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This task was not relocated' });
    }

    // Check if there is another task in the project that has the original IP
    const siblingRes = await client.query(
      'SELECT * FROM survey_tasks WHERE project_id = $1 AND ip_address = $2',
      [currentTask.project_id, originalIp]
    );

    if (siblingRes.rows.length > 0) {
      // Swapped case: swap their survey_data back and clear relocation markers
      const siblingTask = siblingRes.rows[0];

      // Clean survey_data for both
      const cleanCurrentSurveyData = { ...currentTask.survey_data };
      delete cleanCurrentSurveyData['ย้ายมาจาก IP'];
      delete cleanCurrentSurveyData['ประวัติการย้ายไซต์'];

      const cleanSiblingSurveyData = { ...siblingTask.survey_data };
      delete cleanSiblingSurveyData['ย้ายมาจาก IP'];
      delete cleanSiblingSurveyData['ประวัติการย้ายไซต์'];

      // Swap the clean data back to their respective original tasks
      await client.query(
        'UPDATE survey_tasks SET survey_data = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE task_id = $3',
        [JSON.stringify(cleanCurrentSurveyData), currentTask.status || 'Pending', siblingTask.task_id]
      );
      await client.query(
        'UPDATE survey_tasks SET survey_data = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE task_id = $3',
        [JSON.stringify(cleanSiblingSurveyData), siblingTask.status || 'Pending', currentTask.task_id]
      );
    } else {
      // Direct update case: change the IP back directly and clean survey data
      const cleanSurveyData = { ...currentTask.survey_data };
      delete cleanSurveyData['ย้ายมาจาก IP'];
      delete cleanSurveyData['ประวัติการย้ายไซต์'];

      await client.query(
        'UPDATE survey_tasks SET ip_address = $1, survey_data = $2, updated_at = CURRENT_TIMESTAMP WHERE task_id = $3',
        [originalIp, JSON.stringify(cleanSurveyData), id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Relocation reverted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { survey_data, status } = req.body;
    await pool.query(
      'UPDATE survey_tasks SET survey_data = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE task_id = $3',
      [JSON.stringify(survey_data), status || 'Completed', id]
    );
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PHASE 1: MULTI-MASTER DATASET ENDPOINTS
// ==========================================

// Get all Master Datasets
app.get('/api/master-datasets', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM master_datasets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new Master Dataset & Upload Data
app.post('/api/master-datasets', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    const { dataset_name, primary_key_column } = req.body;
    
    if (!dataset_name || !primary_key_column || !req.file) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: 'Missing required fields or file' });
    }

    const workbook = xlsx.readFile(req.file.path, { codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    fs.unlink(req.file.path, () => {});

    if (data.length === 0) return res.status(400).json({ error: 'Empty file' });

    const headers = Object.keys(data[0]);
    if (!headers.includes(primary_key_column)) {
      return res.status(400).json({ error: `Primary key column '${primary_key_column}' not found in file` });
    }

    const schemaConfig = headers.map(h => ({
      name: h,
      label: h,
      type: 'text'
    }));

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const insertDatasetRes = await client.query(
        'INSERT INTO master_datasets (dataset_name, primary_key_column, schema_config) VALUES ($1, $2, $3) RETURNING id',
        [dataset_name, primary_key_column, JSON.stringify(schemaConfig)]
      );
      const datasetId = insertDatasetRes.rows[0].id;

      let importedCount = 0;
      for (const row of data) {
        const pkValue = String(row[primary_key_column] || '').trim();
        if (!pkValue || pkValue === 'undefined') continue;

        await client.query(
          `INSERT INTO master_data_records (dataset_id, primary_key_value, data) 
           VALUES ($1, $2, $3)
           ON CONFLICT (dataset_id, primary_key_value) DO UPDATE SET data = EXCLUDED.data`,
          [datasetId, pkValue, JSON.stringify(row)]
        );
        importedCount++;
      }

      await client.query('COMMIT');
      res.json({ message: 'Master dataset created successfully', datasetId, importedCount });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: error.message });
  }
});

// Delete a Master Dataset
app.delete('/api/master-datasets/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });
    await pool.query('DELETE FROM master_datasets WHERE id = $1', [req.params.id]);
    res.json({ message: 'Dataset deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`App9 Backend running on port ${port}`);
});
