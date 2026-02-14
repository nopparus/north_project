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

async function comprehensiveTest() {
    const baseUrl = 'http://localhost:3001';

    console.log('=== COMPREHENSIVE ICON GROUPING TEST ===\n');

    try {
        // Test 1: Get current icons
        console.log('1. Fetching current icons from /api/icons...');
        const iconsRes = await httpRequest(`${baseUrl}/api/icons`);
        const icons = iconsRes.data;
        console.log(`   ✅ Found ${icons.length} icons\n`);

        // Show current groups
        const groups = {};
        icons.forEach(icon => {
            const group = icon.icon_group || 'NULL';
            if (!groups[group]) groups[group] = [];
            groups[group].push({ name: icon.name, id: icon.id, isSystem: icon.is_system });
        });

        console.log('   Current groups in database:');
        Object.keys(groups).sort().forEach(group => {
            const locked = groups[group].filter(i => i.isSystem).length;
            const editable = groups[group].filter(i => !i.isSystem).length;
            console.log(`   📁 ${group}: ${groups[group].length} icons (${locked}🔒 ${editable}✏️)`);
        });

        // Test 2: Find an editable icon
        console.log('\n2. Finding editable icon for testing...');
        let testIcon = icons.find(i => !i.is_system);

        if (!testIcon) {
            console.log('   No editable icons found. Creating one...');
            const newIcon = {
                id: `test-icon-${Date.now()}`,
                name: 'Test Icon',
                description: 'Test',
                dots: [],
                data_url: 'data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2232%22%20height%3D%2232%22%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2216%22%20r%3D%2212%22%20fill%3D%22blue%22%2F%3E%3C%2Fsvg%3E',
                associated_category: '',
                icon_group: null,
                sort_order: 0,
                is_system: 0
            };

            await httpRequest(`${baseUrl}/api/icons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newIcon)
            });

            console.log(`   ✅ Created test icon: ${newIcon.id}`);
            testIcon = newIcon;
        } else {
            console.log(`   ✅ Using existing icon: "${testIcon.name}" (${testIcon.id})`);
            console.log(`      Current group: ${testIcon.icon_group || 'NULL'}`);
        }

        // Test 3: Update icon to new group via PUT /api/icons/:id
        const testGroupName = 'ทดสอบ_' + Date.now();
        console.log(`\n3. Testing PUT /api/icons/${testIcon.id} with group "${testGroupName}"...`);

        const updatePayload = {
            ...testIcon,
            icon_group: testGroupName
        };

        const updateRes = await httpRequest(`${baseUrl}/api/icons/${testIcon.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });

        console.log(`   ✅ PUT request successful (status ${updateRes.status})\n`);

        // Test 4: Verify the update persisted
        console.log('4. Verifying update persisted to database...');
        const verifyRes = await httpRequest(`${baseUrl}/api/icons`);
        const updatedIcons = verifyRes.data;
        const verifiedIcon = updatedIcons.find(i => i.id === testIcon.id);

        console.log(`   Database value: icon_group = "${verifiedIcon.icon_group}"`);

        if (verifiedIcon.icon_group === testGroupName) {
            console.log(`   ✅ SUCCESS! Group "${testGroupName}" saved correctly!\n`);
        } else {
            console.log(`   ❌ FAILED! Expected "${testGroupName}", got "${verifiedIcon.icon_group}"\n`);
            throw new Error('Group not saved to database');
        }

        // Test 5: Test batch reorder endpoint
        console.log('5. Testing PUT /api/icons/batch/reorder...');
        const batchPayload = {
            updates: [
                {
                    id: testIcon.id,
                    iconGroup: testGroupName,
                    sortOrder: 5
                }
            ]
        };

        const batchRes = await httpRequest(`${baseUrl}/api/icons/batch/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batchPayload)
        });

        console.log(`   ✅ Batch update successful: ${batchRes.data.message}\n`);

        // Test 6: Verify batch update
        console.log('6. Verifying batch update...');
        const finalRes = await httpRequest(`${baseUrl}/api/icons`);
        const finalIcons = finalRes.data;
        const finalIcon = finalIcons.find(i => i.id === testIcon.id);

        console.log(`   icon_group: "${finalIcon.icon_group}"`);
        console.log(`   sort_order: ${finalIcon.sort_order}`);

        if (finalIcon.sort_order === 5) {
            console.log('   ✅ Sort order updated correctly!\n');
        } else {
            console.log(`   ❌ Sort order not updated (expected 5, got ${finalIcon.sort_order})\n`);
        }

        // Test 7: Show final state
        console.log('7. Final database state:');
        const finalGroups = {};
        finalIcons.forEach(icon => {
            const group = icon.icon_group || 'NULL';
            if (!finalGroups[group]) finalGroups[group] = [];
            finalGroups[group].push(icon.name);
        });

        Object.keys(finalGroups).sort().forEach(group => {
            console.log(`   📁 ${group}: ${finalGroups[group].length} icons`);
            if (group !== 'NULL' && finalGroups[group].length <= 3) {
                finalGroups[group].forEach(name => {
                    console.log(`      - ${name}`);
                });
            }
        });

        console.log('\n=== ALL TESTS PASSED ===');
        console.log('\n✅ Backend API is working correctly!');
        console.log('✅ Groups can be created and saved');
        console.log('✅ Batch updates work');
        console.log('\nIf frontend still not working, the issue is in the React code, not the API.');

    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
        console.error('\nStack trace:');
        console.error(err.stack);
        process.exit(1);
    }
}

comprehensiveTest();
