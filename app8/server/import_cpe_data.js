const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@app8-db:5432/app8_db';
const FILE_PATH = '/app/onu_type.xlsx';

const pool = new Pool({
    connectionString: DATABASE_URL
});

const COLUMN_MAP = {
    'Row Labels': 'raw_name',
    'ยี่ห้อ': 'brand',
    'รุ่น': 'model',
    'Version': 'version',
    'ONU Type': 'type',
    'LAN GE': 'lan_ge',
    'LAN FE': 'lan_fe',
    'WiFi': 'wifi',
    'การใช้งาน': 'usage',
    'grade': 'grade'
};

async function run() {
    try {
        console.log(`Starting import from: ${FILE_PATH}`);
        
        // Read Excel
        const workbook = XLSX.readFile(FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
        
        console.log(`Read ${rawData.length} rows from Excel.`);

        // Add columns if they don't exist yet (in case the table wasn't dropped and recreated)
        // Just a precaution so the import doesn't fail if the schema update is partial.
        const addColQueries = [
            'ALTER TABLE cpe_devices ADD COLUMN IF NOT EXISTS version TEXT;',
            'ALTER TABLE cpe_devices ADD COLUMN IF NOT EXISTS type TEXT;',
            'ALTER TABLE cpe_devices ADD COLUMN IF NOT EXISTS lan_ge TEXT;',
            'ALTER TABLE cpe_devices ADD COLUMN IF NOT EXISTS lan_fe TEXT;',
            'ALTER TABLE cpe_devices ADD COLUMN IF NOT EXISTS wifi TEXT;',
            'ALTER TABLE cpe_devices ADD COLUMN IF NOT EXISTS usage TEXT;',
            'ALTER TABLE cpe_devices ADD COLUMN IF NOT EXISTS grade TEXT;'
        ];
        for(let q of addColQueries) {
            await pool.query(q);
        }

        let importedCount = 0;

        for (const row of rawData) {
            const mappedRow = {};
            for (const [thai, english] of Object.entries(COLUMN_MAP)) {
                let val = row[thai];
                if (val === 'NULL' || val === '' || val === '-') {
                    val = null;
                }
                // Convert numbers to strings since DB fields are TEXT
                if (val !== null && val !== undefined) {
                    val = String(val).trim();
                } else {
                    val = null;
                }
                mappedRow[english] = val;
            }

            if (!mappedRow.raw_name) {
                continue; // Skip empty rows
            }

            const query = `
                INSERT INTO cpe_devices (raw_name, brand, model, version, type, lan_ge, lan_fe, wifi, usage, grade)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (raw_name) DO UPDATE SET
                    brand = EXCLUDED.brand,
                    model = EXCLUDED.model,
                    version = EXCLUDED.version,
                    type = EXCLUDED.type,
                    lan_ge = EXCLUDED.lan_ge,
                    lan_fe = EXCLUDED.lan_fe,
                    wifi = EXCLUDED.wifi,
                    usage = EXCLUDED.usage,
                    grade = EXCLUDED.grade,
                    updated_at = CURRENT_TIMESTAMP
            `;

            const values = [
                mappedRow.raw_name, mappedRow.brand, mappedRow.model,
                mappedRow.version, mappedRow.type, mappedRow.lan_ge,
                mappedRow.lan_fe, mappedRow.wifi, mappedRow.usage, mappedRow.grade
            ];

            await pool.query(query, values);
            importedCount++;

            if (importedCount % 100 === 0) {
                console.log(`Imported ${importedCount} / ${rawData.length} rows...`);
            }
        }

        console.log(`\nImport completed successfully! Total imported rows: ${importedCount}`);

    } catch (err) {
        console.error('Import failed:', err);
    } finally {
        await pool.end();
    }
}

run();
