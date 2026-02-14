const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, name, icon_group FROM custom_icons WHERE id = ?', ['icon-1771078385238'], (err, rows) => {
    if (err) {
        console.error('Error:', err);
        process.exit(1);
    }

    console.log('\n=== DATABASE RAW VALUE ===\n');
    rows.forEach(row => {
        console.log(`ID: ${row.id}`);
        console.log(`Name: ${row.name}`);
        console.log(`icon_group value: "${row.icon_group}"`);
        console.log(`icon_group type: ${typeof row.icon_group}`);
        console.log(`icon_group === null: ${row.icon_group === null}`);
        console.log(`icon_group === "undefined": ${row.icon_group === "undefined"}`);
    });

    db.close();
});
