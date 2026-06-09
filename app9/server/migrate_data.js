const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@localhost:5432/app9_db'
});

async function migrateData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if we already migrated
    const existingRes = await client.query('SELECT id FROM master_datasets WHERE dataset_name = $1', ['Legacy OLT Master Data']);
    if (existingRes.rows.length > 0) {
      console.log('Legacy OLT data already migrated.');
      return;
    }

    // 2. Fetch all old data
    console.log('Fetching old OLT data...');
    const oldDataRes = await client.query('SELECT * FROM olt_base_data');
    if (oldDataRes.rows.length === 0) {
      console.log('No legacy data to migrate.');
      return;
    }

    // 3. Create a new master dataset
    const headers = Object.keys(oldDataRes.rows[0]).filter(k => k !== 'created_at');
    const schemaConfig = headers.map(h => ({
      name: h,
      label: h,
      type: 'text'
    }));

    const insertDatasetRes = await client.query(
      'INSERT INTO master_datasets (dataset_name, primary_key_column, schema_config) VALUES ($1, $2, $3) RETURNING id',
      ['Legacy OLT Master Data', 'ne_ip', JSON.stringify(schemaConfig)]
    );
    const datasetId = insertDatasetRes.rows[0].id;
    console.log(`Created new master dataset with ID: ${datasetId}`);

    // 4. Insert records
    console.log(`Migrating ${oldDataRes.rows.length} records...`);
    let count = 0;
    for (const row of oldDataRes.rows) {
      const pkValue = row.ne_ip;
      if (!pkValue) continue;

      // Build JSONB data without created_at
      const rowData = { ...row };
      delete rowData.created_at;

      await client.query(
        `INSERT INTO master_data_records (dataset_id, primary_key_value, data) 
         VALUES ($1, $2, $3)
         ON CONFLICT (dataset_id, primary_key_value) DO NOTHING`,
        [datasetId, pkValue, JSON.stringify(rowData)]
      );
      count++;
      if (count % 500 === 0) console.log(`Migrated ${count} records...`);
    }

    // 5. Update existing survey projects to point to this new dataset
    await client.query('UPDATE survey_projects SET master_dataset_id = $1 WHERE master_dataset_id IS NULL', [datasetId]);
    console.log('Linked existing survey projects to the new master dataset.');

    await client.query('COMMIT');
    console.log('Migration completed successfully!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrateData();
