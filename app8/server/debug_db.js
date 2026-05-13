const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function check() {
    const res = await pool.query("SELECT circuit_id, section, speed, cpe_brand_model FROM onu_records LIMIT 5");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}

check();
