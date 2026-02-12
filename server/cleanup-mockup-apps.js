#!/usr/bin/env node
'use strict';

const { getDB } = require('./db');

console.log('🗑️  Removing mockup apps from database...\n');

const db = getDB();

const mockupAppIds = ['rd-processor', 'ems-transform', 'file-merger'];

for (const appId of mockupAppIds) {
  const result = db.prepare('DELETE FROM apps WHERE id = ?').run(appId);
  if (result.changes > 0) {
    console.log(`✓ Deleted: ${appId}`);
  } else {
    console.log(`- Not found: ${appId}`);
  }
}

console.log('\n✓ Cleanup complete!');
console.log('\nRemaining apps:');
const apps = db.prepare('SELECT id, name FROM apps ORDER BY display_order').all();
apps.forEach(app => {
  console.log(`  - ${app.name} (${app.id})`);
});

process.exit(0);
