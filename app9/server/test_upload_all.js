const { Pool } = require('pg');
const xlsx = require('xlsx');

const pool = new Pool({
  connectionString: 'postgres://postgres:postgrespassword@nexus-app9-db:5432/app9_db'
});

async function run() {
  try {
    const workbook = xlsx.readFile('UMBO_location.csv', { codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    const headerMap = {
      'NO': 'no', 'Operator': 'operator', 'Node_Status': 'node_status', 'Life': 'life',
      'Asset': 'asset', 'Province': 'province', 'Service_Center': 'service_center',
      'ServiceCenter': 'service_center', 'Brand': 'brand', 'NE_IP': 'ne_ip',
      'IP Address': 'ne_ip', 'NE_Name': 'ne_name', 'NE_Type': 'ne_type',
      'Bandwidth': 'bandwidth', 'Used_Port': 'used_port', 'Free_Port': 'free_port',
      'Total': 'total', 'Battery_life': 'battery_life', 'Type': 'type',
      'PON_Type': 'pon_type', 'OLT_Slot': 'olt_slot', 'Platform': 'platform',
      'Name_Umbo': 'name_umbo', 'customer_Umbo': 'customer_umbo', 'OLT_Twin': 'olt_twin',
      'Procurement_OLT': 'procurement_olt', 'Procurement_Battery_Li_On': 'procurement_battery_li_on',
      'Battery_Site': 'battery_site', 'Asset_Battery': 'asset_battery', 'Check_Update_OLT': 'check_update_olt',
      'ID': 'umbo_id', 'LocationName': 'umbo_location_name', 'Latitude': 'latitude', 'Longitude': 'longitude'
    };

    const fileHeaders = Object.keys(data[0]);
    const dbColumns = [];
    const fileKeys = [];

    for (const h of fileHeaders) {
      const dbCol = headerMap[h];
      if (dbCol) {
        dbColumns.push(dbCol);
        fileKeys.push(h);
      }
    }

    const placeholders = dbColumns.map((_, i) => `$${i + 1}`).join(', ');
    const updateClauses = dbColumns
      .filter(col => col !== 'ne_ip')
      .map(col => `${col} = EXCLUDED.${col}`)
      .join(', ');

    const query = `
      INSERT INTO olt_base_data (${dbColumns.join(', ')}) 
      VALUES (${placeholders}) 
      ON CONFLICT (ne_ip) DO UPDATE SET 
      ${updateClauses}
    `;

    let count = 0;
    for (const row of data) {
      const ne_ip_index = dbColumns.indexOf('ne_ip');
      const ne_ip = String(row[fileKeys[ne_ip_index]]).trim();
      
      if (!ne_ip || ne_ip === 'undefined') continue;
      
      const values = fileKeys.map(k => String(row[k] || '').trim());
      await pool.query(query, values);
      count++;
    }
    console.log("Successfully inserted/updated:", count);
  } catch(e) {
    console.error("Error occurred:", e);
  } finally {
    pool.end();
  }
}
run();
