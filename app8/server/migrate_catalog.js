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
        // We select the first occurrence of each brand+model from cpe_devices
        // (since multiple raw_names might map to the same brand/model, but their specs should theoretically be the same)
        const syncQuery = `
            INSERT INTO device_catalog (brand, model, lan_ge, lan_fe, wifi, updated_at)
            SELECT DISTINCT ON (brand, model)
                brand, model, lan_ge, lan_fe, wifi, CURRENT_TIMESTAMP
            FROM cpe_devices
            WHERE brand IS NOT NULL AND model IS NOT NULL
            ON CONFLICT (brand, model) 
            DO UPDATE SET 
                lan_ge = EXCLUDED.lan_ge,
                lan_fe = EXCLUDED.lan_fe,
                wifi = EXCLUDED.wifi,
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
