const pool = require('./server/db');
const fs = require('fs');

async function repair() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log("Starting repair...");

        const fileContent = fs.readFileSync('/tmp/images_20260310.txt', 'utf8');
        const lines = fileContent.split('\n');
        
        const tempRes = await client.query('SELECT id, site_name, province FROM nt_sites_temp');
        const tempMap = {};
        for (const row of tempRes.rows) {
            tempMap[row.id] = row;
        }

        const currRes = await client.query('SELECT id, site_name, province FROM nt_sites');
        const currMap = {};
        for (const row of currRes.rows) {
            // Very relaxed key for matching
            const key = (row.site_name + row.province).replace(/\s/g, '').toLowerCase();
            currMap[key] = row.id;
        }

        let totalImages = 0;
        let restoredImages = 0;
        let missedImages = 0;

        for (const line of lines) {
            if (line.trim() === '' || line.startsWith('COPY') || line.startsWith('\\.')) continue;
            
            const parts = line.split('\t');
            if (parts.length < 4) continue;
            
            totalImages++;
            const oldSiteId = parseInt(parts[1], 10);
            const imageUrl = parts[2];
            
            const oldSite = tempMap[oldSiteId];
            if (oldSite) {
                const searchKey = (oldSite.site_name + oldSite.province).replace(/\s/g, '').toLowerCase();
                const newSiteId = currMap[searchKey];
                
                if (newSiteId) {
                    await client.query(
                        'INSERT INTO nt_site_images (site_id, image_url) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [newSiteId, imageUrl]
                    );
                    restoredImages++;
                } else {
                    missedImages++;
                    if(missedImages < 10) console.log(`Could not find new site for ${oldSite.site_name} (Search: ${searchKey})`);
                }
            } else {
                missedImages++;
            }
        }

        const recContent = fs.readFileSync('/tmp/records_20260310.txt', 'utf8');
        const recLines = recContent.split('\n');
        let restoredRecords = 0;
        
        for (const line of recLines) {
            if (line.trim() === '' || line.startsWith('COPY') || line.startsWith('\\.')) continue;
            const parts = line.split('\t');
            if (parts.length < 5) continue;
            
            const projectId = parts[1];
            const oldSiteId = parseInt(parts[2], 10);
            const customData = parts[3];
            const images = parts[4];
            
            const oldSite = tempMap[oldSiteId];
            if (oldSite) {
                const searchKey = (oldSite.site_name + oldSite.province).replace(/\s/g, '').toLowerCase();
                const newSiteId = currMap[searchKey];
                
                if (newSiteId) {
                    await client.query(
                        `INSERT INTO project_site_records (project_id, site_id, custom_data, images) 
                         VALUES ($1, $2, $3, $4) 
                         ON CONFLICT DO NOTHING`,
                        [projectId, newSiteId, customData, images]
                    );
                    restoredRecords++;
                }
            }
        }

        await client.query('COMMIT');
        console.log(`Done! Total: ${totalImages}. Restored: ${restoredImages}. Missed: ${missedImages}`);
        console.log(`Restored project_site_records: ${restoredRecords}`);

    } catch(err) {
        await client.query('ROLLBACK');
        console.error("Repair error:", err);
    } finally {
        client.release();
    }
}
repair();
