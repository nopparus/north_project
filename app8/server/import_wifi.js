const XLSX = require('xlsx');
const { Pool } = require('pg');
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@app8-db:5432/app8_db';

const pool = new Pool({ connectionString: DATABASE_URL });

const WIFI_COLUMN_MAP = {
    'หมายเลขวงจร': 'circuit_id',
    'ยี่ห้อ': 'brand',
    'รุ่น': 'model',
    'version': 'version'
};

async function run() {
    const FILE_PATH = '/app/WiFiRouter.xlsx';
    console.log('Starting initial WiFi import from:', FILE_PATH);
    try {
        const workbook = XLSX.readFile(FILE_PATH);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        
        await pool.query('TRUNCATE wifi_routers');
        
        const fields = Object.values(WIFI_COLUMN_MAP);
        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            const values = fields.map(field => {
                const thaiHeader = Object.keys(WIFI_COLUMN_MAP).find(k => WIFI_COLUMN_MAP[k] === field);
                return row[thaiHeader] || null;
            });
            const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(', ');
            await pool.query(`INSERT INTO wifi_routers (${fields.join(', ')}) VALUES (${placeholders})`, values);
        }
        console.log(`Successfully imported ${rawData.length} WiFi routers.`);
    } catch (err) {
        console.error('Import failed:', err);
    } finally {
        await pool.end();
    }
}
run();
