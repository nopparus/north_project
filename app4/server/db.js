const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database file
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

module.exports = {
    // Helper to run query returning all rows (SELECT)
    query: (text, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(text, params, (err, rows) => {
                if (err) reject(err);
                else resolve({ rows });
            });
        });
    },
    // Helper to run query returning no rows (INSERT, UPDATE, DELETE)
    // Returns the lastID and changes for context
    run: (text, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(text, params, function (err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    },
    // Helper to get a single row
    get: (text, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(text, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
};
