const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

// --- CONFIG ---
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@app8-db:5432/app8_db';
const FILE_PATH = '/app/ONU_Data.xlsx';
const BATCH_SIZE = 1000;

const pool = new Pool({
    connectionString: DATABASE_URL
});

const COLUMN_MAP = {
    'วันที่ปิดงานติดตั้ง': 'installation_close_date',
    'รหัสใบคำขอ': 'request_id',
    'หมายเลขวงจร': 'circuit_id',
    'จังหวัด(ติดตั้ง)': 'province',
    'บริการหลัก': 'main_service',
    'ความเร็ว': 'speed',
    'ราคา (บาท/เดือน)': 'price',
    'servicesname': 'service_name',
    'วันที่เริ่มโปรโมชัน': 'promotion_start_date',
    'ส่วน': 'section',
    'ชุมสาย': 'exchange',
    'ยี่ห้อ CPE : รุ่น': 'cpe_brand_model',
    'ยี่ห้อ OLT : รุ่น': 'olt_brand_model',
    'สถานะอุปกรณ์ปลายทาง (CPE)': 'cpe_status',
    'สถานะบริการ': 'service_status'
};

function formatDate(val) {
    if (!val) return null;
    let date;
    if (val instanceof Date) {
        date = val;
    } else if (typeof val === 'number') {
        // Excel serial date
        date = XLSX.utils.format_cell({ v: val, t: 'd' }); // This might return a string
        date = new Date(date);
    } else {
        date = new Date(val);
    }

    if (isNaN(date.getTime())) return val; // Return raw if invalid

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
}

async function run() {
    console.log('Starting import from:', FILE_PATH);
    const start = Date.now();

    try {
        const workbook = XLSX.readFile(FILE_PATH, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Read ${rawData.length} rows from Excel.`);

        // Clear existing data (already done by init.sql but just in case if running standalone)
        await pool.query('TRUNCATE onu_records');

        let batch = [];
        let importedCount = 0;

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            const mappedRow = {};

            for (const [thai, english] of Object.entries(COLUMN_MAP)) {
                let val = row[thai];
                if (val === 'NULL' || val === '') {
                    val = null;
                }
                if (val !== null && english.includes('date')) {
                    val = formatDate(val);
                }
                if (val !== null && english === 'price' && typeof val === 'string') {
                    val = val.replace(/,/g, '');
                }
                mappedRow[english] = val;
            }
            batch.push(mappedRow);

            if (batch.length >= BATCH_SIZE || i === rawData.length - 1) {
                await insertBatch(batch);
                importedCount += batch.length;
                console.log(`Imported ${importedCount} / ${rawData.length} rows...`);
                batch = [];
            }
        }

        const duration = (Date.now() - start) / 1000;
        console.log(`Import completed successfully! Total rows: ${importedCount}`);
        console.log(`Time taken: ${duration}s`);

    } catch (err) {
        console.error('Import failed:', err);
    } finally {
        await pool.end();
    }
}

async function insertBatch(batch) {
    if (batch.length === 0) return;

    const fields = Object.values(COLUMN_MAP);
    const placeholders = [];
    const values = [];

    batch.forEach((row, rowIndex) => {
        const rowPlaceholders = [];
        fields.forEach((field, fieldIndex) => {
            rowPlaceholders.push(`$${rowIndex * fields.length + fieldIndex + 1}`);
            values.push(row[field]);
        });
        placeholders.push(`(${rowPlaceholders.join(', ')})`);
    });

    const query = `INSERT INTO onu_records (${fields.join(', ')}) VALUES ${placeholders.join(', ')}`;
    await pool.query(query, values);
}

run();
