const fetch = require('node-fetch');

async function comprehensiveTest() {
    const baseUrl = 'http://localhost:3000';

    console.log('=== COMPREHENSIVE ICON GROUPING TEST ===\n');

    try {
        // Test 1: Check if server is running
        console.log('1. Testing server connection...');
        const pingRes = await fetch(`${baseUrl}/api/materials`);
        if (!pingRes.ok) throw new Error('Server not responding');
        console.log('   ✅ Server is running\n');

        // Test 2: Get current icons
        console.log('2. Fetching current icons...');
        const iconsRes = await fetch(`${baseUrl}/api/icons`);
        const icons = await iconsRes.json();
        console.log(`   Found ${icons.length} icons`);

        // Show current groups
        const groups = {};
        icons.forEach(icon => {
            const group = icon.icon_group || 'NULL';
            if (!groups[group]) groups[group] = [];
            groups[group].push(icon.name);
        });

        console.log('\n   Current groups:');
        Object.keys(groups).sort().forEach(group => {
            console.log(`   📁 ${group}: ${groups[group].length} icons`);
        });

        // Test 3: Find an editable icon
        console.log('\n3. Finding editable icon...');
        const editableIcon = icons.find(i => !i.is_system);
        if (!editableIcon) {
            console.log('   ❌ No editable icons found! Creating one...');

            const newIcon = {
                id: `test-icon-${Date.now()}`,
                name: 'Test Icon',
                description: 'Test',
                dots: [],
                data_url: 'data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2232%22%20height%3D%2232%22%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2216%22%20r%3D%2212%22%20fill%3D%22blue%22%2F%3E%3C%2Fsvg%3E',
                associated_category: '',
                icon_group: null,
                sort_order: 0,
                is_system: false
            };

            const createRes = await fetch(`${baseUrl}/api/icons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newIcon)
            });

            if (!createRes.ok) {
                const error = await createRes.text();
                throw new Error(`Failed to create icon: ${error}`);
            }

            console.log(`   ✅ Created test icon: ${newIcon.id}`);
            editableIcon = newIcon;
        } else {
            console.log(`   ✅ Using icon: ${editableIcon.name} (${editableIcon.id})`);
        }

        // Test 4: Create a new group by updating icon
        const testGroupName = 'ทดสอบ_' + Date.now();
        console.log(`\n4. Creating group "${testGroupName}"...`);

        const updatePayload = {
            ...editableIcon,
            icon_group: testGroupName
        };

        console.log('   Sending PUT request...');
        const updateRes = await fetch(`${baseUrl}/api/icons/${editableIcon.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });

        if (!updateRes.ok) {
            const error = await updateRes.text();
            throw new Error(`Update failed: ${error}`);
        }

        console.log('   ✅ Update request successful\n');

        // Test 5: Verify the update
        console.log('5. Verifying update...');
        const verifyRes = await fetch(`${baseUrl}/api/icons`);
        const updatedIcons = await verifyRes.json();
        const verifiedIcon = updatedIcons.find(i => i.id === editableIcon.id);

        console.log(`   Icon group in database: "${verifiedIcon.icon_group}"`);

        if (verifiedIcon.icon_group === testGroupName) {
            console.log('   ✅ SUCCESS! Group saved to database!\n');
        } else {
            console.log(`   ❌ FAILED! Expected "${testGroupName}", got "${verifiedIcon.icon_group}"\n`);
        }

        // Test 6: Test batch reorder endpoint
        console.log('6. Testing batch reorder endpoint...');
        const batchPayload = {
            updates: [
                {
                    id: editableIcon.id,
                    iconGroup: testGroupName,
                    sortOrder: 0
                }
            ]
        };

        const batchRes = await fetch(`${baseUrl}/api/icons/batch/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batchPayload)
        });

        if (!batchRes.ok) {
            const error = await batchRes.text();
            console.log(`   ❌ Batch update failed: ${error}\n`);
        } else {
            const result = await batchRes.json();
            console.log(`   ✅ Batch update successful: ${result.message}\n`);
        }

        // Test 7: Show final state
        console.log('7. Final database state:');
        const finalRes = await fetch(`${baseUrl}/api/icons`);
        const finalIcons = await finalRes.json();

        const finalGroups = {};
        finalIcons.forEach(icon => {
            const group = icon.icon_group || 'NULL';
            if (!finalGroups[group]) finalGroups[group] = [];
            finalGroups[group].push(icon.name);
        });

        Object.keys(finalGroups).sort().forEach(group => {
            console.log(`   📁 ${group}: ${finalGroups[group].length} icons`);
            if (group !== 'NULL') {
                finalGroups[group].forEach(name => {
                    console.log(`      - ${name}`);
                });
            }
        });

        console.log('\n=== TEST COMPLETE ===');

    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
        console.error(err.stack);
    }
}

comprehensiveTest();
