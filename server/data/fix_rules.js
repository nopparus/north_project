const sqlite = require('better-sqlite3');
const db = new sqlite('/home/nopparus2/www/server/data/nexus.db');

try {
    const configRow = db.prepare("SELECT * FROM app1_configs WHERE key = 'rd03_rules_v2'").get();
    if (configRow) {
        let rules = JSON.parse(configRow.value);
        let changed = false;
        rules = rules.map(r => {
            // Fix 1.4 rules if they are incorrectly tagged as mapping
            if (r.id.includes('1.4') || r.name.includes('1.4')) {
                if (r.targetField !== 'Group') {
                    r.targetField = 'Group';
                    changed = true;
                }
            }
            return r;
        });
        if (changed) {
            db.prepare("UPDATE app1_configs SET value = ? WHERE key = 'rd03_rules_v2'").run(JSON.stringify(rules));
            console.log("Updated rd03_rules_v2: 1.4 rules fixed.");
        }
    }

    const configRow05 = db.prepare("SELECT * FROM app1_configs WHERE key = 'rd05_rules_v2'").get();
    if (configRow05) {
        let rules = JSON.parse(configRow05.value);
        let changed = false;
        rules = rules.map(r => {
            if (r.id.includes('1.4') || r.name.includes('1.4')) {
                if (r.targetField !== 'Group') {
                    r.targetField = 'Group';
                    changed = true;
                }
            }
            return r;
        });
        if (changed) {
            db.prepare("UPDATE app1_configs SET value = ? WHERE key = 'rd05_rules_v2'").run(JSON.stringify(rules));
            console.log("Updated rd05_rules_v2: 1.4 rules fixed.");
        }
    }
} catch (e) {
    console.error("Error updating DB:", e.message);
}
