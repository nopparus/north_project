const fs = require('fs');
const csv = require('csv-parser');
const pool = require('./db');
const path = require('path');
require('dotenv').config();

const CSV_FILE_PATH = process.argv[2] || 'locations.csv';

async function importLocations() {
    const client = await pool.connect();
    const results = [];

    console.log(`Reading CSV file: ${CSV_FILE_PATH}`);

    if (!fs.existsSync(CSV_FILE_PATH)) {
        console.error(`Error: File not found: ${CSV_FILE_PATH}`);
        console.log('Usage: node import_locations.js <path_to_csv>');
        process.exit(1);
    }

    fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                console.log(`Parsed ${results.length} rows.`);

                await client.query('BEGIN');

                // 1. Truncate existing data
                console.log('Truncating existing nt_locations table...');
                await client.query('TRUNCATE nt_locations RESTART IDENTITY');

                // 2. Insert new data
                console.log('Inserting new data...');
                const insertQuery = `
                    INSERT INTO nt_locations (
                        id, LocationName, Latitude, Longitude, ServiceCenter, Province, Type, image_url
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `;

                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    // CSV Headers: ID,LocationName,IP Address,Latitude,Longitude,ServiceCenter,Province,Type,

                    const id = row.ID ? parseInt(row.ID) : (i + 1);
                    const name = row.LocationName || '';
                    const lat = parseFloat(row.Latitude || 0);
                    const lng = parseFloat(row.Longitude || 0);
                    const center = row.ServiceCenter || '';
                    const province = row.Province || '';
                    const type = row.Type || '';
                    const image = null; // No image url in this CSV

                    await client.query(insertQuery, [id, name, lat, lng, center, province, type, image]);
                }

                await client.query('COMMIT');
                console.log('Import completed successfully.');
            } catch (err) {
                await client.query('ROLLBACK');
                console.error('Error importing data:', err);
            } finally {
                client.release();
                pool.end();
            }
        });
}

importLocations();
