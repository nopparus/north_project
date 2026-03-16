require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'nexus-app5-db',
    database: process.env.DB_NAME || 'pms',
    password: process.env.DB_PASSWORD || '13700352',
    port: process.env.DB_PORT || 5432,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating map_layers table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS map_layers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                schema JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert a default map layer for existing NT Sites if none exists
        console.log('Ensuring default map layer exists...');
        const { rows } = await client.query(`
            INSERT INTO map_layers (name, schema)
            SELECT 'NT Sites', '[]'::jsonb
            WHERE NOT EXISTS (SELECT 1 FROM map_layers WHERE name = 'NT Sites')
            RETURNING id;
        `);

        let defaultLayerId;
        if (rows.length > 0) {
            defaultLayerId = rows[0].id;
        } else {
            const res = await client.query(`SELECT id FROM map_layers WHERE name = 'NT Sites' LIMIT 1`);
            defaultLayerId = res.rows[0].id;
        }

        console.log(`Default Layer ID: ${defaultLayerId}`);

        // Add map_id to nt_sites
        console.log('Adding map_id to nt_sites...');
        await client.query(`
            ALTER TABLE nt_sites 
            ADD COLUMN IF NOT EXISTS map_id UUID REFERENCES map_layers(id);
        `);

        // Set default map_id for existing records
        console.log('Updating existing nt_sites with default map_id...');
        await client.query(`
            UPDATE nt_sites SET map_id = $1 WHERE map_id IS NULL;
        `, [defaultLayerId]);

        // Make map_id NOT NULL after updating
        console.log('Making map_id NOT NULL...');
        await client.query(`
            ALTER TABLE nt_sites ALTER COLUMN map_id SET NOT NULL;
        `);

        // Add custom_data JSONB to nt_sites
        console.log('Adding custom_data column to nt_sites...');
        await client.query(`
            ALTER TABLE nt_sites 
            ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}'::jsonb;
        `);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
