
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@app8-db:5432/app8_db'
});

async function migrate() {
  const rawData = [
    { rb: 'D-Link CORP.', rm: 'DIR825M', tb: 'D-Link', tm: 'DIR825M' },
    { rb: 'DLINK', rm: 'DIR1251', tb: 'D-Link', tm: 'DIR1251' },
    { rb: 'DLINK', rm: 'DIR842', tb: 'D-Link', tm: 'DIR842' },
    { rb: 'DLink', rm: 'DIR-X3000Z', tb: 'D-Link', tm: 'DIR-X3000Z' },
    { rb: 'FiberHome', rm: 'SR1041F', tb: 'FiberHome', tm: 'SR1041F' },
    { rb: 'FiberHome', rm: 'SR1041Y', tb: 'FiberHome', tm: 'SR1041Y' },
    { rb: 'FiberHome', rm: 'SR120A', tb: 'FiberHome', tm: 'SR120A' },
    { rb: 'T3', rm: 'A622T', tb: 'T3', tm: 'A622T' },
    { rb: 'T3', rm: 'A626T', tb: 'T3', tm: 'A626T' },
    { rb: 'TP-LINK', rm: 'IGD', tb: 'TP-Link', tm: 'IGD' },
    { rb: 'TP-Link', rm: 'Archer C6', tb: 'TP-Link', tm: 'Archer C6' },
    { rb: 'TP-Link', rm: 'ArcherC5', tb: 'TP-Link', tm: 'Archer C5' },
    { rb: 'TP-Link', rm: 'EC230-G1', tb: 'TP-Link', tm: 'EC230-G1' },
    { rb: 'TP-Link', rm: 'EC230G1', tb: 'TP-Link', tm: 'EC230-G1' },
    { rb: 'TP-Link', rm: 'EC231G1u', tb: 'TP-Link', tm: 'EC231G1u' },
    { rb: 'TP-Link', rm: 'EX221-G5', tb: 'TP-Link', tm: 'EX221-G5' },
    { rb: 'TP-Link', rm: 'EX221G5', tb: 'TP-Link', tm: 'EX221-G5' },
    { rb: 'TP-Link', rm: 'EX511', tb: 'TP-Link', tm: 'EX511' },
    { rb: 'TP-Link', rm: 'EX820v', tb: 'TP-Link', tm: 'EX820v' },
    { rb: 'TP-Link', rm: 'IGD', tb: 'TP-Link', tm: 'IGD' },
    { rb: 'ZIONCOM', rm: 'TOTOLINK_A3002RU', tb: 'Zioncom', tm: 'TOTOLINK_A3002RU' },
    { rb: 'ZIONCOM', rm: 'TOTOLINK_A3002RU_V2', tb: 'Zioncom', tm: 'TOTOLINK_A3002RU_V2' },
    { rb: 'ZTE', rm: 'H196Q', tb: 'ZTE', tm: 'H196Q' },
    { rb: 'ZTE', rm: 'H198A', tb: 'ZTE', tm: 'H198A' },
    { rb: 'ZTE', rm: 'H3601P', tb: 'ZTE', tm: 'H3601P' },
    { rb: 'ZTE', rm: 'H6645PV2', tb: 'ZTE', tm: 'H6645PV2' },
    { rb: 'ZTE', rm: 'H8102E', tb: 'ZTE', tm: 'H8102E' },
    { rb: 'ZYXEL', rm: 'EX3220T0', tb: 'Zyxel', tm: 'EX3220T0' },
    { rb: 'ZYXEL', rm: 'EX3300-T0', tb: 'Zyxel', tm: 'EX3300-T0' },
    { rb: 'ZYXEL', rm: 'EX3300T0', tb: 'Zyxel', tm: 'EX3300-T0' },
    { rb: 'ZYXEL', rm: 'EX3320T0', tb: 'Zyxel', tm: 'EX3320T0' },
    { rb: 'Zyxel', rm: 'EMG2881-T20B', tb: 'Zyxel', tm: 'EMG2881-T20B' },
    { rb: 'Zyxel', rm: 'EMG2881T20B', tb: 'Zyxel', tm: 'EMG2881-T20B' }
  ];

  try {
    // 1. First, clear and recreate the catalog entries to be "Improved"
    // We only touch WiFi Router entries
    await pool.query("DELETE FROM device_catalog WHERE type = 'WiFi Router'");
    
    const uniqueCatalog = Array.from(new Set(rawData.map(r => `${r.tb}|${r.tm}`)));
    for (const item of uniqueCatalog) {
      const [brand, model] = item.split('|');
      await pool.query(
        "INSERT INTO device_catalog (brand, model, type) VALUES ($1, $2, 'WiFi Router') ON CONFLICT DO NOTHING",
        [brand, model]
      );
    }
    console.log(`Catalog updated with ${uniqueCatalog.length} standardized WiFi Router models.`);

    // 2. Clear and fill wifi_mappings
    await pool.query("DELETE FROM wifi_mappings");
    for (const r of rawData) {
      await pool.query(
        "INSERT INTO wifi_mappings (raw_brand, raw_model, target_brand, target_model) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
        [r.rb, r.rm, r.tb, r.tm]
      );
    }
    console.log(`WiFi Mappings updated with ${rawData.length} auto-mappings.`);

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
