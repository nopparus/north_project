const Database = require('better-sqlite3');
const db = new Database('./data/nexus.db');

const rows = db.prepare("SELECT key, value FROM nexus_configs WHERE key LIKE '%rules%'").all();

rows.forEach(row => {
    try {
        const rules = JSON.parse(row.value);
        const found = rules.find(r => r.id === 'gc-1772108271567');
        if (found) {
            console.log(`[FOUND in ${row.key}]`, JSON.stringify(found, null, 2));
        } else {
            console.log(`[NOT FOUND in ${row.key}]`);
        }
    } catch (e) {
        console.log(`[ERROR parsing ${row.key}]`);
    }
});
db.close();
