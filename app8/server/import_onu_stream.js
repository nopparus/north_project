const ExcelJS = require('exceljs');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@app8-db:5432/app8_db';
const FILE_PATH = '/app/ONU Recoards.xlsx';
const BATCH_SIZE = 1000;

const pool = new Pool({ connectionString: DATABASE_URL });

const COLUMN_MAP = {
    'วันที่สร้างคำขอ': 'req_date',
    'วันที่ปิดงานติดตั้ง': 'installation_close_date',
    'รหัสใบคำขอ': 'request_id',
    'หมายเลขวงจร': 'circuit_id',
    'BA': 'ba',
    'Offer ID': 'offer_id',
    'ชื่อลูกค้า': 'customer_name',
    'กลุ่มลูกค้า': 'customer_group',
    'ประเภทลูกค้า': 'customer_type',
    'จังหวัด(ติดตั้ง)': 'province',
    'บริการหลัก': 'main_service',
    'โปรโมชั่น': 'promotion',
    'แพ็คเก็จ': 'package_name',
    'ความเร็ว': 'speed',
    'ราคา (บาท/เดือน)': 'price',
    'servicesname': 'service_name',
    'วันที่เริ่มโปรโมชัน': 'promotion_start_date',
    'ระยะเวลาสัญญา': 'contract_period',
    'ส่วน': 'section',
    'ศูนย์บริการขาย': 'sales_center',
    'ชุมสาย': 'exchange',
    'ยี่ห้อ CPE : รุ่น': 'cpe_brand_model',
    'ยี่ห้อ OLT : รุ่น': 'olt_brand_model',
    'สถานะอุปกรณ์ปลายทาง (CPE)': 'cpe_status',
    'ประมาณระยะทาง': 'distance',
    'สถานะบริการ': 'service_status',
    'ระยะการเป็นลูกค้า(เดือน)': 'customer_duration',
    'รุ่น': 'model',
    'ยี่ห้อ': 'brand',
    'กองงานตรวจแก้': 'maintenance_team'
};

function formatDate(val) {
    if (!val) return null;
    let date = new Date(val);
    if (isNaN(date.getTime())) return val;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
}

async function run() {
    console.log('Starting stream import from:', FILE_PATH);
    const start = Date.now();

    try {
        await pool.query('TRUNCATE onu_records');

        const workbook = new ExcelJS.stream.xlsx.WorkbookReader(FILE_PATH);
        
        let headerRow = null;
        let headerIndices = {};
        let batch = [];
        let importedCount = 0;

        for await (const worksheet of workbook) {
            console.log(`Processing worksheet...`);
            
            for await (const row of worksheet) {
                if (!headerRow) {
                    const values = row.values;
                    if (!values) continue;
                    
                    const keywords = ['หมายเลขวงจร', 'รหัสใบคำขอ', 'ชื่อลูกค้า'];
                    const isHeader = values.some(v => v && keywords.some(k => v.toString().toUpperCase().includes(k.toUpperCase())));
                    
                    if (isHeader) {
                        headerRow = values;
                        Object.keys(COLUMN_MAP).forEach(thaiCol => {
                            const cleanThaiCol = thaiCol.toUpperCase();
                            const idx = headerRow.findIndex(v => v && v.toString().replace(/[^\x20-\x7E\u0E00-\u0E7F]/g, '').trim().toUpperCase() === cleanThaiCol);
                            if (idx !== -1) headerIndices[thaiCol] = idx;
                        });
                        console.log(`Found headers:`, JSON.stringify(headerIndices));
                        continue;
                    }
                    continue;
                }

                // Process data row
                const mappedRow = {};
                for (const [thai, english] of Object.entries(COLUMN_MAP)) {
                    const idx = headerIndices[thai];
                    let val = idx !== undefined ? row.values[idx] : null;
                    
                    if (val && typeof val === 'object' && val.result) val = val.result;
                    if (val === 'NULL' || val === '') val = null;
                    
                    if (val !== null && english.includes('date')) {
                        val = formatDate(val);
                    }
                    if (val !== null && english === 'price' && typeof val === 'string') {
                        val = val.replace(/,/g, '');
                    }
                    mappedRow[english] = val;
                }

                if (!mappedRow.circuit_id) continue; // skip empty rows

                batch.push(mappedRow);

                if (batch.length >= BATCH_SIZE) {
                    await insertBatch(batch);
                    importedCount += batch.length;
                    batch = [];
                    if (importedCount % 5000 === 0) console.log(`Imported ${importedCount} rows...`);
                }
            }
        }
        
        // Insert remaining
        if (batch.length > 0) {
            await insertBatch(batch);
            importedCount += batch.length;
        }

        const duration = (Date.now() - start) / 1000;
        console.log(`Import completed successfully! Total rows: ${importedCount}`);
        console.log(`Time taken: ${duration}s`);
        
        // After import, refresh MV
        console.log('Refreshing materialized view...');
        await pool.query('REFRESH MATERIALIZED VIEW mv_circuit_summary');
        console.log('Done refreshing MV.');

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
