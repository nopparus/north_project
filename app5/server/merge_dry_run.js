const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'app5-db',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: 5432,
    database: process.env.POSTGRES_DB || 'pms',
});

// Haversine formula for distance in meters
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371e3; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in m
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

async function analyze() {
    try {
        const res = await pool.query('SELECT * FROM nt_locations ORDER BY id');
        const locations = res.rows;
        console.log(`Total locations: ${locations.length}`);

        const processed = new Set();
        const clusters = [];

        // Threshold: 200 sqm area -> approx 8 meter radius.
        // Let's use 10 meters to be safe.
        const THRESHOLD_METERS = 10;

        for (let i = 0; i < locations.length; i++) {
            if (processed.has(locations[i].id)) continue;

            const cluster = [locations[i]];
            processed.add(locations[i].id);

            for (let j = i + 1; j < locations.length; j++) {
                if (processed.has(locations[j].id)) continue;

                const dist = getDistanceFromLatLonInM(
                    locations[i].latitude, locations[i].longitude,
                    locations[j].latitude, locations[j].longitude
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

        clusters.forEach((cluster, idx) => {
            const names = cluster.map(l => l.locationname).filter(n => n).join(' / ');
            console.log(`\nCluster ${idx + 1}: ${cluster.length} items`);
            console.log(`IDs: ${cluster.map(c => c.id).join(', ')}`);
            console.log(`Merged Name: ${names}`);
            console.log(`Coordinates: ${cluster[0].latitude}, ${cluster[0].longitude}`);
        });

        pool.end();
    } catch (err) {
        console.error(err);
        pool.end();
    }
}

analyze();
