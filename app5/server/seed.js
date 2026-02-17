const pool = require('./db');
const { v4: uuidv4 } = require('uuid');

const PROVINCES = [
    "แม่ฮ่องสอน", "เชียงใหม่", "เชียงราย", "ลำปาง", "พะเยา",
    "ลำพูน", "น่าน", "แพร่", "อุตรดิตถ์", "พิษณุโลก"
];

const SITE_NAMES = ["Site A", "Site B", "Site C", "Main Station", "Sub Station", "Tower X", "Tower Y"];

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Clear existing data
        await client.query('TRUNCATE projects, locations, maintenance_records, schedule_items RESTART IDENTITY CASCADE');

        console.log('Seeding Locations...');
        const locationIds = [];
        for (const province of PROVINCES) {
            for (const siteName of SITE_NAMES) {
                if (Math.random() > 0.7) continue; // Randomly skip some
                const res = await client.query(
                    `INSERT INTO locations (province, site_name, num_facilities, num_generators)
             VALUES ($1, $2, $3, $4) RETURNING id`,
                    [province, `${province} - ${siteName}`, Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 2)]
                );
                locationIds.push(res.rows[0].id);
            }
        }

        console.log('Seeding Projects...');
        // PM Project
        const pmProjectRes = await client.query(
            `INSERT INTO projects (name, status, color, equipment_types, work_type)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            ['PM Project 2024 (North)', 'active', '#3b82f6', JSON.stringify(['AC', 'Battery', 'Generator', 'Rectifier']), 'PM']
        );
        const pmProjectId = pmProjectRes.rows[0].id;

        // Survey Project
        const surveyProjectRes = await client.query(
            `INSERT INTO projects (name, status, color, equipment_types, work_type)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            ['Site Survey Q1 2024', 'on-hold', '#10b981', JSON.stringify(['Infrastructure', 'Security', 'Environment']), 'Survey']
        );
        const surveyProjectId = surveyProjectRes.rows[0].id;

        console.log('Seeding Records...');
        const statuses = ['Normal', 'Normal', 'Normal', 'Abnormal'];

        // PM Records
        for (let i = 0; i < 20; i++) {
            const locId = locationIds[Math.floor(Math.random() * locationIds.length)];
            const eqType = ['AC', 'Battery', 'Generator', 'Rectifier'][Math.floor(Math.random() * 4)];
            await client.query(
                `INSERT INTO maintenance_records (project_id, work_type, site_id, equipment_type, date, inspector, status, data)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [pmProjectId, 'PM', locId, eqType, '2024-02-15', 'Technician A', statuses[Math.floor(Math.random() * 4)], '{}']
            );
        }

        // Survey Records
        for (let i = 0; i < 15; i++) {
            const locId = locationIds[Math.floor(Math.random() * locationIds.length)];
            const eqType = ['Infrastructure', 'Security'][Math.floor(Math.random() * 2)];
            await client.query(
                `INSERT INTO maintenance_records (project_id, work_type, site_id, equipment_type, date, inspector, status, data, condition_rating)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [surveyProjectId, 'Survey', locId, eqType, '2024-02-10', 'Engineeer B', statuses[Math.floor(Math.random() * 4)], '{}', Math.floor(Math.random() * 5) + 1]
            );
        }

        console.log('Seeding Schedule...');
        await client.query(
            `INSERT INTO schedule_items (project_id, equipment_type, start_month, duration, label)
         VALUES ($1, $2, $3, $4, $5)`,
            [pmProjectId, 'AC', 1, 3, 'Q1 AC Maintenance']
        );
        await client.query(
            `INSERT INTO schedule_items (project_id, equipment_type, start_month, duration, label)
         VALUES ($1, $2, $3, $4, $5)`,
            [pmProjectId, 'Battery', 4, 3, 'Q2 Battery Check']
        );

        await client.query('COMMIT');
        console.log('Seeding completed successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding data:', e);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
