#!/usr/bin/env node
'use strict';

const { getDB, SEED_APPS } = require('./db');

console.log('🔄 Fixing apps in database...\n');

const db = getDB();

// Delete mockup internal apps
console.log('Removing mockup apps:');
const mockupAppIds = ['ai-writer', 'analytics', 'tasks'];
for (const appId of mockupAppIds) {
  const result = db.prepare('DELETE FROM apps WHERE id = ?').run(appId);
  if (result.changes > 0) {
    console.log(`  ✓ Deleted: ${appId}`);
  }
}

// Re-insert real apps from SEED_APPS
console.log('\nRestoring real apps:');
const stmt = db.prepare(
  'INSERT OR REPLACE INTO apps (id, name, description, icon, color, path, app_type, iframe_src, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

for (const app of SEED_APPS) {
  stmt.run(app.id, app.name, app.description, app.icon, app.color, app.path, app.app_type, app.iframe_src, app.display_order);
  console.log(`  ✓ Added: ${app.name} (${app.id})`);
}

console.log('\n✅ Fix complete!\n');
console.log('Current apps in database:');
const apps = db.prepare('SELECT id, name, path FROM apps ORDER BY display_order').all();
apps.forEach(app => {
  console.log(`  - ${app.name} → ${app.path}`);
});

process.exit(0);
