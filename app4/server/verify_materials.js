const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const csvPath = path.resolve(__dirname, '../mat.csv');

// Helper to parse numeric values from CSV (remove commas, trim)
function parseNum(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/,/g, '').trim()) || 0;
}

async function check() {
    console.log('--- Material Verification ---');

    // 1. Load CSV source (Manual Parse)
    let csvMaterials = [];
    if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n');

        // Skip header (line 0)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Basic CSV split (handling quotes is tricky but let's try a simple split first, 
            // or specific regex if needed. The file seems to have quotes around numbers like " 1,510.00 ")
            // Given the complexity of quotes, let's use a regex to split by comma outside quotes
            const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            // Actually, a simpler regex for splitting CSV:
            // /,(?=(?:(?:[^"]*"){2})*[^"]*$)/

            const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.trim().replace(/^"|"$/g, '').trim());

            // Check if line is just empty commas
            if (cols.every(c => !c)) continue;

            if (cols.length >= 4) {
                csvMaterials.push({
                    no: cols[0],
                    category: cols[1],
                    type: cols[2],
                    item: cols[3], // Material Name
                    unit: cols[4],
                    // ... other fields
                });
            }
        }
        console.log(`Source (mat.csv): ${csvMaterials.length} valid items`);
    } else {
        console.log('Source (mat.csv): Not found');
    }

    // 2. Load from DB
    db.all('SELECT * FROM materials', [], (err, rows) => {
        if (err) {
            console.error('DB Error:', err);
            return;
        }
        console.log(`Database (Table 'materials'): ${rows.length} items`);

        // Compare
        if (csvMaterials.length > 0) {
            let matches = 0;
            let missingInDb = 0;

            const missingExamples = [];

            for (const csvItem of csvMaterials) {
                // Try literal match on name
                // DB column is material_name
                // CSV column 'Item' corresponds to material_name
                const found = rows.find(r => r.material_name && r.material_name.trim() === csvItem.item.trim());

                if (found) {
                    matches++;
                } else {
                    missingInDb++;
                    if (missingExamples.length < 5) missingExamples.push(csvItem.item);
                }
            }

            console.log(`Matched: ${matches}`);
            if (missingInDb > 0) {
                console.log(`Missing in DB: ${missingInDb}`);
                console.log('Sample missing:', missingExamples);
            } else {
                console.log('Result: All CSV items are present in Database.');
            }
        }

        db.close();
    });
}

check();
