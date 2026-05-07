-- ======================================================
-- MIGRATION: Move onu_type, version, usage, grade fields
--            from cpe_devices -> device_catalog
-- ======================================================

-- STEP 1: Add new columns to device_catalog (if not exist)
ALTER TABLE device_catalog
  ADD COLUMN IF NOT EXISTS onu_type TEXT,
  ADD COLUMN IF NOT EXISTS version  TEXT,
  ADD COLUMN IF NOT EXISTS usage    TEXT,
  ADD COLUMN IF NOT EXISTS grade    TEXT;

-- STEP 2: Copy data from cpe_devices into device_catalog
--   Match on brand+model. Only update if catalog row already exists.
UPDATE device_catalog dc
SET
    onu_type   = COALESCE(dc.onu_type,  cd.onu_type),
    version    = COALESCE(dc.version,   cd.version),
    lan_ge     = COALESCE(dc.lan_ge,    cd.lan_ge),
    lan_fe     = COALESCE(dc.lan_fe,    cd.lan_fe),
    wifi       = COALESCE(dc.wifi,      cd.wifi),
    usage      = COALESCE(dc.usage,     cd.usage),
    grade      = COALESCE(dc.grade,     cd.grade),
    updated_at = CURRENT_TIMESTAMP
FROM cpe_devices cd
WHERE dc.brand = cd.brand
  AND dc.model = cd.model;

-- STEP 3: Drop migrated columns from cpe_devices
ALTER TABLE cpe_devices
  DROP COLUMN IF EXISTS onu_type,
  DROP COLUMN IF EXISTS version,
  DROP COLUMN IF EXISTS lan_ge,
  DROP COLUMN IF EXISTS lan_fe,
  DROP COLUMN IF EXISTS wifi,
  DROP COLUMN IF EXISTS usage,
  DROP COLUMN IF EXISTS grade;

-- Done
SELECT 'Migration complete' AS status;
