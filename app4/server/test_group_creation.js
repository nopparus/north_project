// Test script to create a new icon group
const fetch = require('node-fetch');

async function testGroupCreation() {
    const baseUrl = 'http://localhost:3000';

    console.log('=== Testing Icon Group Creation ===\n');

    // Step 1: Get all icons
    console.log('1. Fetching all icons...');
    const iconsRes = await fetch(`${baseUrl}/api/icons`);
    const icons = await iconsRes.json();
    console.log(`   Found ${icons.length} icons\n`);

    // Step 2: Find first editable icon (not system)
    const editableIcon = icons.find(i => !i.is_system);
    if (!editableIcon) {
        console.log('❌ No editable icons found!');
        return;
    }
    console.log(`2. Using icon: ${editableIcon.name} (${editableIcon.id})`);
    console.log(`   Current group: ${editableIcon.icon_group || 'NULL'}\n`);

    // Step 3: Update icon to new group
    const newGroupName = 'ทดสอบ';
    console.log(`3. Updating icon to group "${newGroupName}"...`);

    const updateRes = await fetch(`${baseUrl}/api/icons/${editableIcon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...editableIcon,
            icon_group: newGroupName
        })
    });

    if (!updateRes.ok) {
        const error = await updateRes.text();
        console.log(`❌ Update failed: ${error}`);
        return;
    }

    console.log('✅ Update successful!\n');

    // Step 4: Verify update
    console.log('4. Verifying update...');
    const verifyRes = await fetch(`${baseUrl}/api/icons`);
    const updatedIcons = await verifyRes.json();
    const verifiedIcon = updatedIcons.find(i => i.id === editableIcon.id);

    console.log(`   Icon group is now: ${verifiedIcon.icon_group || 'NULL'}`);

    if (verifiedIcon.icon_group === newGroupName) {
        console.log('\n✅ SUCCESS! Group created and saved to database!');
    } else {
        console.log('\n❌ FAILED! Group not saved to database!');
    }

    // Step 5: Show all groups
    console.log('\n5. All groups in database:');
    const groups = {};
    updatedIcons.forEach(icon => {
        const group = icon.icon_group || 'NULL';
        if (!groups[group]) groups[group] = 0;
        groups[group]++;
    });

    Object.keys(groups).sort().forEach(group => {
        console.log(`   📁 ${group}: ${groups[group]} icons`);
    });
}

testGroupCreation().catch(err => {
    console.error('Error:', err.message);
});
