const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    host: process.env.DB_HOST || '127.0.0.1', // Need to run outside docker for migration, so change 'db' to 'localhost' if running from host
    port: process.env.DB_PORT || 5432,
    database: process.env.POSTGRES_DB || 'pms',
});

// Haversine distance in meters
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the earth in m
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('Starting migration...');

        // 1. Create new tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS nt_sites (
                id SERIAL PRIMARY KEY,
                site_name VARCHAR(255),
                latitude DECIMAL(11, 8),
                longitude DECIMAL(11, 8),
                service_center VARCHAR(255),
                province VARCHAR(255),
                type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS nt_site_images (
                id SERIAL PRIMARY KEY,
                site_id INT REFERENCES nt_sites(id) ON DELETE CASCADE,
                image_url TEXT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Check if site_id exists on nt_locations, add if not
        const columnCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='nt_locations' AND column_name='site_id';
        `);
        if (columnCheck.rows.length === 0) {
            await client.query('ALTER TABLE nt_locations ADD COLUMN site_id INT REFERENCES nt_sites(id) ON DELETE SET NULL;');
        }

        // 2. Fetch all locations
        // We will order by ID to be deterministic
        const res = await client.query('SELECT * FROM nt_locations ORDER BY id ASC');
        const locations = res.rows;
        console.log(`Fetched ${locations.length} locations`);

        let sites = [];
        let siteIdCounter = 1;

        // 3. Grouping logic
        console.log('Grouping locations...');
        for (const loc of locations) {
            let foundSite = null;
            for (const site of sites) {
                const dist = getDistance(loc.latitude, loc.longitude, site.latitude, site.longitude);
                if (dist <= 20) { // 20 meters
                    foundSite = site;
                    break;
                }
            }

            if (foundSite) {
                foundSite.locations.push(loc);
                if (loc.image_url) {
                    foundSite.images.push(loc.image_url);
                }
            } else {
                sites.push({
                    id: siteIdCounter++,
                    site_name: loc.locationname ? loc.locationname.replace(/OLT_?/ig, '') : '', // Using first OLT name as site name, stripping out OLT
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    service_center: loc.servicecenter,
                    province: loc.province,
                    type: loc.type || 'Type D (Small)', // default type if null
                    images: loc.image_url ? [loc.image_url] : [],
                    locations: [loc]
                });
            }
        }

        console.log(`Created ${sites.length} sites from ${locations.length} locations`);

        // 4. Insert Sites and update locations
        // To be safe, let's clear existing sites if running multiple times
        await client.query('TRUNCATE nt_sites CASCADE');

        let updatedOltCount = 0;
        let insertedImagesCount = 0;

        for (const site of sites) {
            // Determine type: if > 2 OLTs, Type C
            let siteType = site.type;
            if (site.locations.length > 2) {
                siteType = 'Type C (District)'; // Using App5 convention for Type C
            } else if (!siteType) {
                siteType = 'Type D (Small)';
            }

            const insertSiteRes = await client.query(`
                INSERT INTO nt_sites (site_name, latitude, longitude, service_center, province, type)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id;
            `, [site.site_name, site.latitude, site.longitude, site.service_center, site.province, siteType]);

            const dbSiteId = insertSiteRes.rows[0].id;

            // Insert images
            for (const imgUrl of site.images) {
                await client.query(`
                    INSERT INTO nt_site_images (site_id, image_url)
                    VALUES ($1, $2);
                `, [dbSiteId, imgUrl]);
                insertedImagesCount++;
            }

            // Update locations
            for (const loc of site.locations) {
                await client.query(`
                    UPDATE nt_locations SET site_id = $1 WHERE id = $2;
                `, [dbSiteId, loc.id]);
                updatedOltCount++;
            }
        }

        console.log(`Successfully migrated!`);
        console.log(`- Created ${sites.length} Sites`);
        console.log(`- Inserted ${insertedImagesCount} Images`);
        console.log(`- Updated ${updatedOltCount} OLTs`);

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
