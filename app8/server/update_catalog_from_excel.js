const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('CRITICAL: DATABASE_URL is not defined in environment variables!');
    process.exit(1);
}

const FILE_PATH = path.join(__dirname, 'Device_Catalog_update.xlsx');

const pool = new Pool({
    connectionString: DATABASE_URL
});

const COLUMN_MAP = {
    'ยี่ห้อ': 'brand',
    'รุ่น': 'model',
    'Hardware Type': 'type',
    'LAN GE': 'lan_ge',
    'LAN FE': 'lan_fe',
    'WiFi Spec': 'wifi',
    'ราคา': 'price',
    'Max Speed': 'max_speed'
};

async function run() {
    try {
        console.log(`Starting update from: ${FILE_PATH}`);
        
        // Read Excel
        const workbook = XLSX.readFile(FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
        
        console.log(`Read ${rawData.length} rows from Excel.`);

        let updatedCount = 0;

        for (const row of rawData) {
            const mappedRow = {};
            for (const [thai, english] of Object.entries(COLUMN_MAP)) {
                let val = row[thai];
                if (val === 'NULL' || val === '' || val === '-') {
                    val = null;
                }
                
                if (val !== null && val !== undefined) {
                    if (english === 'price') {
                        // Handle price as number
                        val = parseFloat(String(val).replace(/,/g, ''));
                        if (isNaN(val)) val = null;
                    } else {
                        // Convert others to strings
                        val = String(val).trim();
                    }
                } else {
                    val = null;
                }
                mappedRow[english] = val;
            }

            if (!mappedRow.brand || !mappedRow.model) {
                continue; // Skip rows without brand/model
            }

            const query = `
                INSERT INTO device_catalog (brand, model, type, lan_ge, lan_fe, wifi, price, max_speed)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (brand, model) DO UPDATE SET
                    type = EXCLUDED.type,
                    lan_ge = EXCLUDED.lan_ge,
                    lan_fe = EXCLUDED.lan_fe,
                    wifi = EXCLUDED.wifi,
                    price = EXCLUDED.price,
                    max_speed = EXCLUDED.max_speed,
                    updated_at = CURRENT_TIMESTAMP
            `;

            const values = [
                mappedRow.brand, mappedRow.model, mappedRow.type,
                mappedRow.lan_ge, mappedRow.lan_fe, mappedRow.wifi,
                mappedRow.price, mappedRow.max_speed
            ];

            await pool.query(query, values);
            updatedCount++;

            if (updatedCount % 50 === 0) {
                console.log(`Processed ${updatedCount} / ${rawData.length} rows...`);
            }
        }

        console.log(`\nUpdate completed successfully! Total processed rows: ${updatedCount}`);

    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        await pool.end();
    }
}

run();
