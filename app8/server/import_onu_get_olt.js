
const fs = require('fs');
const readline = require('readline');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function importCsv() {
    const filePath = './ONU_GET_OLT.csv';
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }

    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
    });

    let count = 0;
    const BATCH_SIZE = 500;
    let batch = [];

    console.log('Starting import from ONU_GET_OLT.csv...');
    await pool.query('TRUNCATE onu_get_olt');
    console.log('Table truncated.');

    let isFirstLine = true;
    for await (const line of rl) {
        if (isFirstLine) {
            isFirstLine = false;
            continue;
        }
        if (!line.trim()) continue;

        // Simple CSV parser
        const values = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i+1] === '"') {
                    cur += '"'; // Escaped quote
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(cur.trim());
                cur = "";
            } else {
                cur += char;
            }
        }
        values.push(cur.trim());

        // Ensure we have exactly 43 columns (or pad/truncate)
        // Ensure we have exactly 43 columns (or pad/truncate)
        const paddedValues = Array(43).fill(null);
        for (let i = 0; i < Math.min(values.length, 43); i++) {
            paddedValues[i] = values[i] || null;
        }

        // Cleanup service column (index 23, c24)
        if (paddedValues[23]) {
            const match = paddedValues[23].match(/\d{4}[jJ]\d{4}/);
            paddedValues[23] = match ? match[0] : null;
        }

        batch.push(paddedValues);

        if (batch.length >= BATCH_SIZE) {
            await insertBatch(batch);
            batch = [];
            count += BATCH_SIZE;
            if (count % 5000 === 0) console.log(`Imported ${count} rows...`);
        }
    }

    if (batch.length > 0) {
        await insertBatch(batch);
        count += batch.length;
    }

    console.log(`Import completed. Total rows: ${count}`);
    process.exit(0);
}

async function insertBatch(rows) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const queryText = `INSERT INTO onu_get_olt (${Array.from({length: 43}, (_, i) => `c${i+1}`).join(', ')}) VALUES (${Array.from({length: 43}, (_, i) => `$${i+1}`).join(', ')})`;
        for (const row of rows) {
            await client.query(queryText, row);
        }
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Batch insert failed:', e);
    } finally {
        client.release();
    }
}

importCsv().catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
});
