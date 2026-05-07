const ExcelJS = require('exceljs');
const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const COLUMN_MAP = {
    'ONU SERIAL': 'onu_serial',
    'หมายเลขวงจร': 'circuit_id',
    'BA': 'ba',
    'Offer ID': 'offer_id',
    'ชื่อลูกค้า': 'customer_name',
    'กลุ่มลูกค้า': 'customer_group',
    'ประเภทลูกค้า': 'customer_type',
    'จังหวัด(ติดตั้ง)': 'province',
    'บริการหลัก': 'main_service',
    'โปรโมชั่น': 'promotion',
    'แพ็คเก็จ': 'package',
    'ความเร็ว': 'speed',
    'ราคา (บาท/เดือน)': 'price',
    'servicesname': 'services_name',
    'วันที่เริ่มโปรโมชัน': 'start_date',
    'ระยะเวลาสัญญา': 'contract_period',
    'ส่วน': 'section',
    'ศูนย์บริการขาย': 'sales_center',
    'ชุมสาย': 'exchange',
    'ยี่ห้อ CPE : รุ่น': 'cpe_brand_model',
    'ยี่ห้อ OLT : รุ่น': 'olt_brand_model',
    'สถานะอุปกรณ์ปลายทาง (CPE)': 'cpe_status',
    'ประมาณระยะทาง': 'distance_est',
    'สถานะบริการ': 'service_status',
    'ระยะการเป็นลูกค้า(เดือน)': 'customer_tenure',
    'รุ่น': 'model',
    'ยี่ห้อ': 'brand',
    'กองงานตรวจแก้': 'maintenance_unit'
};

const importData = async () => {
    try {
        console.log('Reading ONU.xlsx with ExcelJS Stream...');
        const workbook = new ExcelJS.stream.xlsx.WorkbookReader('./ONU.xlsx');
        
        let headerRow = null;
        let headerIndices = {};
        let count = 0;
        let failedCount = 0;
        const failedRows = [];
        let batch = [];
        const BATCH_SIZE = 100;

        const columns = Object.values(COLUMN_MAP);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertQuery = `
            INSERT INTO onu_records (${columns.join(', ')}, custom_data) 
            VALUES (${placeholders}, $${columns.length + 1}) 
            ON CONFLICT (onu_serial) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        `;

        for await (const worksheet of workbook) {
            console.log(`Processing worksheet: ${worksheet.name}`);
            headerRow = null; // Reset for each sheet just in case

            for await (const row of worksheet) {
                if (!headerRow) {
                    const values = row.values;
                    if (!values) continue;
                    
                    // Search for any of our keywords in this row to identify it as header
                    const keywords = ['ONU SERIAL', 'หมายเลขวงจร', 'BA', 'Offer ID', 'ชื่อลูกค้า'];
                    const isHeader = values.some(v => v && keywords.some(k => v.toString().toUpperCase().includes(k.toUpperCase())));
                    
                    if (isHeader) {
                        headerRow = values;
                        // Map each column from COLUMN_MAP to an index in the sheet
                        Object.keys(COLUMN_MAP).forEach(thaiCol => {
                            const idx = headerRow.findIndex(v => v && v.toString().trim().replace(/[^\x20-\x7E\u0E00-\u0E7F]/g, '').toUpperCase() === thaiCol.toUpperCase());
                            if (idx !== -1) headerIndices[thaiCol] = idx;
                        });
                        console.log(`Found header row in sheet ${worksheet.name}:`, JSON.stringify(headerIndices));
                        continue;
                    }
                    
                    // If we've scanned more than 50 rows without finding a header, skip this sheet or keep looking
                    if (row.number > 50) {
                        console.log(`No header found in first 50 rows of ${worksheet.name}, skipping sheet.`);
                        break; 
                    }
                    continue;
                }

                // Process data row
                try {
                    const rowObj = {};
                    headerRow.forEach((header, idx) => {
                        if (header) {
                            const cleanHeader = typeof header === 'string' ? header.replace(/[^\x20-\x7E\u0E00-\u0E7F]/g, '').trim() : header;
                            rowObj[cleanHeader] = row.values[idx];
                        }
                    });

                    const values = Object.keys(COLUMN_MAP).map(thaiCol => {
                        const idx = headerIndices[thaiCol];
                        let val = idx !== undefined ? row.values[idx] : null;
                        const dbCol = COLUMN_MAP[thaiCol];
                        
                        if (dbCol === 'price') val = parseFloat(val) || 0;
                        if (dbCol === 'start_date') {
                            if (!val || val === '0000-00-00' || val === '0000-00-00 00:00:00' || val === 'NULL' || val === '-') {
                                val = null;
                            } else {
                                const d = new Date(val);
                                if (isNaN(d.getTime())) val = null;
                            }
                        }
                        
                        if (val && typeof val === 'object' && val.result) val = val.result;
                        return val === undefined || val === 'NULL' ? null : val;
                    });
                    
                    // Skip if mandatory field ONU Serial is missing
                    if (!values[0]) {
                        // console.log(`Skipping row ${row.number} due to missing Serial`);
                        continue;
                    }

                    values.push(JSON.stringify(rowObj));
                    
                    // Execute immediately or add to batch
                    // To handle errors per row, we'll execute one by one for now or use a smaller batch
                    await pool.query(insertQuery, values);
                    count++;

                    if (count % 5000 === 0) console.log(`Successfully imported ${count} rows...`);
                } catch (rowErr) {
                    failedCount++;
                    const failedInfo = { row: row.number, error: rowErr.message, serial: row.values[headerIndices['ONU SERIAL']] };
                    failedRows.push(failedInfo);
                    if (failedRows.length <= 100) {
                        fs.appendFileSync('import_errors.log', JSON.stringify(failedInfo) + '\n');
                    }
                }
            }
        }

        console.log(`Import completed.`);
        console.log(`Total Success: ${count}`);
        console.log(`Total Failed: ${failedCount}`);
        
        const summary = {
            timestamp: new Date().toISOString(),
            total_success: count,
            total_failed: failedCount,
            error_log: 'import_errors.log'
        };
        fs.writeFileSync('import_summary.json', JSON.stringify(summary, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error('Fatal import error:', err);
        process.exit(1);
    }
};

importData();
