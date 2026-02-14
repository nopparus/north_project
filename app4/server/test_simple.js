const http = require('http');

function httpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve({ ok: true, status: res.statusCode, data: JSON.parse(data) });
                    } catch (e) {
                        resolve({ ok: true, status: res.statusCode, data });
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

async function simpleTest() {
    const baseUrl = 'http://localhost:3001';
    const testIconId = 'icon-1771078385238';

    console.log('=== SIMPLE GROUP TEST ===\n');

    try {
        // Step 1: Get icon before update
        console.log('1. Getting icon BEFORE update...');
        let res = await httpRequest(`${baseUrl}/api/icons`);
        let icon = res.data.find(i => i.id === testIconId);
        console.log(`   icon_group: "${icon.icon_group}"`);
        console.log(`   iconGroup: "${icon.iconGroup}"`);

        // Step 2: Update with new group
        const newGroup = 'TestGroup_' + Date.now();
        console.log(`\n2. Updating to group "${newGroup}"...`);

        await httpRequest(`${baseUrl}/api/icons/${testIconId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...icon,
                icon_group: newGroup
            })
        });

        console.log('   ✅ PUT successful\n');

        // Step 3: Get icon AFTER update
        console.log('3. Getting icon AFTER update...');
        res = await httpRequest(`${baseUrl}/api/icons`);
        icon = res.data.find(i => i.id === testIconId);
        console.log(`   icon_group: "${icon.icon_group}"`);
        console.log(`   iconGroup: "${icon.iconGroup}"`);

        if (icon.iconGroup === newGroup) {
            console.log(`\n✅ SUCCESS! Group saved correctly!`);
        } else {
            console.log(`\n❌ FAILED! Expected "${newGroup}", got "${icon.iconGroup}"`);
        }

    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
        process.exit(1);
    }
}

simpleTest();
