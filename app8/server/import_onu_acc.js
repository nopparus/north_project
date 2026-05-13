const ExcelJS = require('exceljs');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'app8-db',
    database: process.env.DB_NAME || 'app8_db',
    password: process.env.DB_PASSWORD || 'postgrespassword',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function importData() {
    console.log('Starting import from ONU_ACC.xlsx...');
    const startTime = Date.now();
    
    const workbook = new ExcelJS.stream.xlsx.WorkbookReader('./ONU_ACC.xlsx');
    let count = 0;
    let batch = [];
    const BATCH_SIZE = 1000;

    for await (const worksheet of workbook) {
        for await (const row of worksheet) {
            count++;
            if (count === 1) continue; // Skip header

            // Map columns: 1: ONU_Actual_Type, 2: Brand, 3: Province, 4: Project, 5: onutype, 6: service, 7: service_group, 8: StartDate_CSS
            const values = [
                row.getCell(1).value?.toString() || null,
                row.getCell(2).value?.toString() || null,
                row.getCell(3).value?.toString() || null,
                row.getCell(4).value?.toString() || null,
                row.getCell(5).value?.toString() || null,
                row.getCell(6).value?.toString() || null,
                row.getCell(7).value?.toString() || null,
                row.getCell(8).value?.toString() || null
            ];
            
            batch.push(values);

            if (batch.length >= BATCH_SIZE) {
                await insertBatch(batch);
                batch = [];
                console.log(`Imported ${count-1} rows...`);
            }
        }
    }

    if (batch.length > 0) {
        await insertBatch(batch);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`Import finished! Total rows: ${count-1}. Duration: ${duration}s`);
    await pool.end();
}

async function insertBatch(batch) {
    const client = await pool.connect();
    try {
        const placeholders = batch.map((_, i) => 
            `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${i * 8 + 5}, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`
        ).join(',');
        
        const flatValues = batch.flat();
        const query = `INSERT INTO onu_get_olt (onu_actual_type, brand, province, project, onutype, service, service_group, start_date_css) VALUES ${placeholders}`;
        
        await client.query(query, flatValues);
    } catch (err) {
        console.error('Batch insert error:', err);
    } finally {
        client.release();
    }
}

importData().catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
});
