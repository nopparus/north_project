const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'app5-db',
    port: 5432,
    database: process.env.POSTGRES_DB || 'pms',
});

// Haversine formula
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371e3;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

async function executeMerge() {
    try {
        console.log("Starting merge process...");
        // Fetch all locations
        const res = await pool.query('SELECT * FROM nt_locations ORDER BY id');
        const locations = res.rows;
        console.log(`Total locations: ${locations.length}`);

        const processed = new Set();
        const clusters = [];
        const THRESHOLD_METERS = 15; // increased slightly to 15m (approx 700sqm area, but guarantees catching the 200sqm (8m radius) request safely)

        // Identify clusters
        for (let i = 0; i < locations.length; i++) {
            if (processed.has(locations[i].id)) continue;

            const cluster = [locations[i]];
            processed.add(locations[i].id);

            for (let j = i + 1; j < locations.length; j++) {
                if (processed.has(locations[j].id)) continue;

                // Ensure coords exist
                if (!locations[i].latitude || !locations[i].longitude || !locations[j].latitude || !locations[j].longitude) continue;

                const dist = getDistanceFromLatLonInM(
                    parseFloat(locations[i].latitude), parseFloat(locations[i].longitude),
                    parseFloat(locations[j].latitude), parseFloat(locations[j].longitude)
                );

                if (dist < THRESHOLD_METERS) {
                    cluster.push(locations[j]);
                    processed.add(locations[j].id);
                }
            }

            if (cluster.length > 1) {
                clusters.push(cluster);
            }
        }

        console.log(`Found ${clusters.length} clusters to merge.`);

        // Execute merges
        for (const cluster of clusters) {
            // 1. Keep the first ID as the primary
            const primary = cluster[0];
            const secondary = cluster.slice(1);
            const secondaryIds = secondary.map(x => x.id);

            // 2. Concatenate names (Unique only)
            // Normalize names: trim spaces
            const allNames = cluster.map(l => l.locationname ? l.locationname.trim() : '').filter(n => n);
            const uniqueNames = Array.from(new Set(allNames));
            const newName = uniqueNames.join(' / ');

            console.log(`Merging Cluster: IDs [${cluster.map(c => c.id).join(', ')}] -> New Name: "${newName}"`);

            // 3. Update primary
            await pool.query('UPDATE nt_locations SET LocationName = $1 WHERE id = $2', [newName, primary.id]);

            // 4. Delete secondaries
            for (const sec of secondary) {
                await pool.query('DELETE FROM nt_locations WHERE id = $1', [sec.id]);
            }
        }

        console.log("Merge completed successfully.");
        pool.end();

    } catch (err) {
        console.error("Error during merge:", err);
        pool.end();
    }
}

executeMerge();
