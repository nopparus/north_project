import Database from 'better-sqlite3';
import fs from 'fs';
import readline from 'readline';

const dbPath = 'survey.db';
const db = new Database(dbPath);

const insertSite = db.prepare(`
  INSERT INTO sites (
    request_id, circuit_id, location, sub_district, district, province,
    region, department, section, latitude, longitude, ip_address,
    electricity_request, power_source, is_surveyed
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

async function processLineByLine() {
    const fileStream = fs.createReadStream('../stit24.7k.csv');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    db.exec('BEGIN TRANSACTION');

    let count = 0;
    for await (const line of rl) {
        if (!line.trim()) continue;

        // Simple split by comma (assuming no commas inside quotes for this dataset)
        const columns = line.split(',');

        if (columns.length >= 15) {
            try {
                insertSite.run(
                    columns[1] || '', // request_id
                    columns[2] || '', // circuit_id
                    columns[3] || '', // location
                    columns[4] || '', // sub_district
                    columns[5] || '', // district
                    columns[6] || '', // province
                    columns[7] || '', // region
                    columns[8] || '', // department
                    columns[9] || '', // section
                    parseFloat(columns[10]) || 0, // latitude
                    parseFloat(columns[11]) || 0, // longitude
                    columns[12] || '', // ip_address
                    columns[13] || '', // electricity_request
                    columns[14] || '', // power_source
                    parseInt(columns[18]) || 0  // is_surveyed (index 18 based on sample)
                );
                count++;
            } catch (e) {
                console.error('Error inserting line:', line, e);
            }
        }
    }

    db.exec('COMMIT');
    console.log(`Successfully imported ${count} records.`);
}

db.exec('DELETE FROM sites'); // Clear old data
console.log('Cleared existing data.');
processLineByLine().catch(console.error);

