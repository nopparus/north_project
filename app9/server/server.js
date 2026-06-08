const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const multer = require('multer');
const xlsx = require('xlsx');
const ExcelJS = require('exceljs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3009;
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

// Upload Excel and Generate Project
app.post('/api/parse-survey-excel', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) return res.status(400).json({ error: 'Empty excel file' });

    const headers = Object.keys(data[0]);
    const ipKey = headers.find(h => h.toLowerCase().includes('ip')) || headers[0];
    const otherHeaders = headers.filter(h => h !== ipKey);

    res.json({ headers: otherHeaders, ipKey, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-survey-project', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requires admin role' });

    const { projectName, displayMode, formSchema, data, ipKey } = req.body;
    if (!projectName || !formSchema || !data || !ipKey) return res.status(400).json({ error: 'Missing required fields' });

    // Create Project
    const projRes = await pool.query(
      'INSERT INTO survey_projects (project_name, form_schema, display_mode) VALUES ($1, $2, $3) RETURNING project_id',
      [projectName, JSON.stringify(formSchema), displayMode || 'form']
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

async function processOltUpload(filePath, jobId) {
  try {
    const workbook = xlsx.readFile(filePath, { codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    if (data.length === 0) {
      uploadJobs[jobId] = { status: 'error', message: 'Empty file' };
      return;
    }

    const headerMap = {
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
      'ID': 'umbo_id', 'LocationName': 'umbo_location_name', 'Latitude': 'latitude', 'Longitude': 'longitude'
    };

    const fileHeaders = Object.keys(data[0]);
    const dbColumns = [];
    const fileKeys = [];

    for (const h of fileHeaders) {
      const dbCol = headerMap[h];
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

    const query = `
      INSERT INTO olt_base_data (${dbColumns.join(', ')}) 
      VALUES (${placeholders}) 
      ON CONFLICT (ne_ip) DO UPDATE SET 
      ${updateClauses}
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
    uploadJobs[jobId].status = 'error';
    uploadJobs[jobId].message = error.message;
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
    const result = await pool.query('SELECT * FROM survey_projects ORDER BY created_at DESC');
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

    const columns = Object.keys(data[0]).map(k => ({ name: k, filterButton: true }));
    const rows = data.map(row => Object.values(row).map(v => v !== null && v !== undefined ? String(v) : ''));

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
      `SELECT t.*, s.site_name, s.location, o.province, o.ne_name 
       FROM survey_tasks t
       JOIN sites s ON t.ip_address = s.ip_address
       LEFT JOIN olt_base_data o ON t.ip_address = o.ne_ip
       WHERE t.project_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

app.listen(port, () => {
  console.log(`App9 Backend running on port ${port}`);
});
