const sqlite = require('better-sqlite3');
const db = new sqlite('/home/nopparus2/www/server/data/nexus.db');

function fixRules(rules) {
    if (!Array.isArray(rules)) return rules;
    return rules.map(r => {
        // Force Classification for rules that look like classification (IDs 1.1, 1.2, 1.3, 1.4, 2.x, etc.)
        const isGrouping = /^[1-9]\.[0-9]+(\.[0-9]+)?/.test(r.id) || /^[1-9]\.[0-9]+(\.[0-9]+)?/.test(r.name);

        if (isGrouping) {
            if (r.targetField !== 'Group') {
                console.log(`Fixing ${r.id} (${r.name}) -> Group`);
                r.targetField = 'Group';
            }
        } else if (!r.targetField || r.id.startsWith('gc')) {
            // Default to Mapping for gc rules
            if (r.targetField !== 'GroupConcession') {
                console.log(`Fixing ${r.id} (${r.name}) -> GroupConcession`);
                r.targetField = 'GroupConcession';
            }
        }
        return r;
    });
}

try {
    const keys = ['rd03_rules_v2', 'rd05_rules_v2'];
    keys.forEach(key => {
        const row = db.prepare("SELECT value FROM app1_configs WHERE key = ?").get(key);
        if (row) {
            let rules = JSON.parse(row.value);
            const fixed = fixRules(rules);
            db.prepare("UPDATE app1_configs SET value = ? WHERE key = ?").run(JSON.stringify(fixed), key);
            console.log(`Finished ${key}`);
        }
    });
} catch (e) {
    console.error("Error:", e.message);
}
