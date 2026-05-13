const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function check() {
    try {
        console.log("Checking columns of onu_records...");
        const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'onu_records'");
        console.log("Columns:", cols.rows.map(r => r.column_name).join(', '));

        console.log("\nChecking specific circuit_id: 5328j4794@fttxhome");
        const res = await pool.query("SELECT * FROM onu_records WHERE circuit_id = '5328j4794@fttxhome'");
        console.log("Data:", JSON.stringify(res.rows, null, 2));

        console.log("\nChecking join with cpe_devices...");
        const joinRes = await pool.query(`
            SELECT o.circuit_id, o.cpe_brand_model, d.brand, d.model 
            FROM onu_records o 
            LEFT JOIN cpe_devices d ON o.cpe_brand_model = d.raw_name 
            WHERE o.circuit_id = '5328j4794@fttxhome'
        `);
        console.log("Join Result:", JSON.stringify(joinRes.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

check();
