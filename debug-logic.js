const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:postgrespassword@nexus-app8-db:5432/app8_db'
});

async function run() {
    const threshold = 500;
    const result = await pool.query(`
        SELECT 
            onu_brand,
            onu_model,
            onu_device_type,
            is_onu_without_wifi,
            wifi_brand,
            wifi_model,
            effective_max_speed,
            CASE 
                WHEN (onu_lan_fe IS NOT NULL AND onu_lan_fe != '' AND onu_lan_fe != '0')
                     AND (onu_lan_ge IS NULL OR onu_lan_ge = '' OR onu_lan_ge = '0')
                THEN true ELSE false 
            END as is_fe_only,
            COUNT(DISTINCT circuit_norm) as circuit_count
        FROM mv_circuit_summary
        GROUP BY 
            onu_brand, 
            onu_model,
            onu_device_type,
            is_onu_without_wifi,
            wifi_brand,
            wifi_model,
            effective_max_speed,
            CASE 
                WHEN (onu_lan_fe IS NOT NULL AND onu_lan_fe != '' AND onu_lan_fe != '0')
                     AND (onu_lan_ge IS NULL OR onu_lan_ge = '' OR onu_lan_ge = '0')
                THEN true ELSE false 
            END
    `);

    const feOnlyGroup = {};
    const outdatedAPGroup = {};
    const noWifiGroup = {};

    for (const row of result.rows) {
        const { onu_brand, onu_model, onu_device_type, is_onu_without_wifi, wifi_brand, wifi_model, effective_max_speed, is_fe_only, circuit_count } = row;
        const count = parseInt(circuit_count);
        const isOnu = (onu_device_type || '').toLowerCase().includes('onu');
        
        if (is_fe_only && isOnu) {
            const brand = onu_brand || 'Pending Mapping';
            if (!feOnlyGroup[brand]) feOnlyGroup[brand] = { brand, total: 0, models: [] };
            feOnlyGroup[brand].total += count;
        }
        if (wifi_brand && wifi_model && !is_fe_only) {
            const speed = parseInt(effective_max_speed) || 0;
            if (speed > 0 && speed < threshold) {
                const brand = wifi_brand || 'Unknown';
                if (!outdatedAPGroup[brand]) outdatedAPGroup[brand] = { brand, total: 0, models: [] };
                outdatedAPGroup[brand].total += count;
            }
        }
        if (onu_device_type === 'ONU Bridge' && is_onu_without_wifi) {
            const brand = onu_brand || 'Pending Mapping';
            if (!noWifiGroup[brand]) noWifiGroup[brand] = { brand, total: 0, models: [] };
            noWifiGroup[brand].total += count;
        }
    }

    console.log('FE Only Brands:', Object.keys(feOnlyGroup).length, 'Total:', Object.values(feOnlyGroup).reduce((s, b) => s + b.total, 0));
    console.log('Outdated AP Brands:', Object.keys(outdatedAPGroup).length, 'Total:', Object.values(outdatedAPGroup).reduce((s, b) => s + b.total, 0));
    console.log('No Wifi Brands:', Object.keys(noWifiGroup).length, 'Total:', Object.values(noWifiGroup).reduce((s, b) => s + b.total, 0));
    process.exit(0);
}
run();
