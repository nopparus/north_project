const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const seed = async () => {
    try {
        const passwordHash = await bcrypt.hash('admin123', 10);
        await pool.query('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING', ['admin', passwordHash, 'admin']);
        console.log('Default admin created (admin / admin123)');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
};

seed();
