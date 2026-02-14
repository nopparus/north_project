const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Adding icon_group and sort_order columns to custom_icons table...');

    // Add icon_group column
    db.run(`ALTER TABLE custom_icons ADD COLUMN icon_group TEXT`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('✓ icon_group column already exists');
            } else {
                console.error('Error adding icon_group:', err.message);
            }
        } else {
            console.log('✓ Added icon_group column');
        }
    });

    // Add sort_order column
    db.run(`ALTER TABLE custom_icons ADD COLUMN sort_order INTEGER DEFAULT 0`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('✓ sort_order column already exists');
            } else {
                console.error('Error adding sort_order:', err.message);
            }
        } else {
            console.log('✓ Added sort_order column');
        }
    });

    // Update existing icons to have default sort_order based on their current position
    db.run(`UPDATE custom_icons SET sort_order = ROWID WHERE sort_order IS NULL OR sort_order = 0`, (err) => {
        if (err) {
            console.error('Error updating sort_order:', err.message);
        } else {
            console.log('✓ Updated existing icons with sort_order');
        }
    });
});

db.close(() => {
    console.log('Migration complete!');
});
