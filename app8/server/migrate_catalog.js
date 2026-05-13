const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@app8-db:5432/app8_db';
const pool = new Pool({ connectionString: DATABASE_URL });

async function migrate() {
    try {
        console.log('Starting device_catalog migration...');
        
        // 1. Alter Table
        const alterQueries = [
            'ALTER TABLE device_catalog ADD COLUMN IF NOT EXISTS lan_ge TEXT;',
            'ALTER TABLE device_catalog ADD COLUMN IF NOT EXISTS lan_fe TEXT;',
            'ALTER TABLE device_catalog ADD COLUMN IF NOT EXISTS wifi TEXT;',
            'ALTER TABLE device_catalog DROP COLUMN IF EXISTS interface_lan;',
            'ALTER TABLE device_catalog DROP COLUMN IF EXISTS interface_wifi;'
        ];
        
        for (let q of alterQueries) {
            await pool.query(q);
        }
        console.log('Table structure updated.');

        // 2. Sync Data from cpe_devices
        const syncQuery = `
            INSERT INTO device_catalog (brand, model, type, version, lan_ge, lan_fe, wifi, usage, grade, updated_at)
            SELECT DISTINCT ON (brand, model)
                brand, model, type, version, lan_ge, lan_fe, wifi, usage, grade, CURRENT_TIMESTAMP
            FROM cpe_devices
            WHERE brand IS NOT NULL AND model IS NOT NULL
            ON CONFLICT (brand, model) 
            DO UPDATE SET 
                type = EXCLUDED.type,
                version = EXCLUDED.version,
                lan_ge = EXCLUDED.lan_ge,
                lan_fe = EXCLUDED.lan_fe,
                wifi = EXCLUDED.wifi,
                usage = EXCLUDED.usage,
                grade = EXCLUDED.grade,
                updated_at = CURRENT_TIMESTAMP;
        `;
        
        const result = await pool.query(syncQuery);
        console.log(`Synced ${result.rowCount} distinct brand/model combinations to device_catalog.`);
        
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
