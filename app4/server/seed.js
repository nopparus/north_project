
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Read materials-db.ts and extract the array
const dbFile = fs.readFileSync(path.join(__dirname, '../materials-db.ts'), 'utf8');
// Simple regex to extract the JSON-like array from the TS file
// This assumes the format `export const ALL_MATERIALS: Material[] = [...]`
const match = dbFile.match(/export const ALL_MATERIALS: Material\[\] = (\[[\s\S]*?\]);/);

if (!match) {
    console.error('Could not find ALL_MATERIALS in materials-db.ts');
    process.exit(1);
}

// The content is TS/JS object literal, not strict JSON (keys aren't quoted).
// We need to act like a JS runtime to evaluate it safely-ish, or regex replace keys.
// Evaluation is easiest for this one-off script.
const materials = eval(match[1]);

async function seed() {
    try {
        console.log(`Seeding ${materials.length} materials...`);
        const res = await axios.post('http://localhost:3000/api/materials/seed', materials);
        console.log(res.data);
    } catch (e) {
        console.error('Error seeding:', e.message);
    }
}

seed();
