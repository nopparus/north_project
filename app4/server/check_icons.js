const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, name, icon_group, sort_order, is_system FROM custom_icons ORDER BY icon_group, sort_order', [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
        process.exit(1);
    }

    console.log('\n=== CUSTOM ICONS IN DATABASE ===\n');
    console.log('Total icons:', rows.length);
    console.log('\nGrouped by icon_group:\n');

    const grouped = {};
    rows.forEach(row => {
        const group = row.icon_group || 'NULL';
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(row);
    });

    Object.keys(grouped).sort().forEach(group => {
        console.log(`\n📁 ${group} (${grouped[group].length} icons):`);
        grouped[group].forEach(icon => {
            const lock = icon.is_system ? '🔒' : '✏️';
            console.log(`  ${lock} [${icon.sort_order || 0}] ${icon.id}: ${icon.name}`);
        });
    });

    db.close();
});
