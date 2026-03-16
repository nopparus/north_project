BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS map_layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    schema JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default map layer for existing NT Sites if none exists
INSERT INTO map_layers (name, schema)
SELECT 'NT Sites', '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM map_layers WHERE name = 'NT Sites');

-- Add map_id to nt_sites
ALTER TABLE nt_sites ADD COLUMN IF NOT EXISTS map_id UUID;

-- Set default map_id for existing records
UPDATE nt_sites 
SET map_id = (SELECT id FROM map_layers WHERE name = 'NT Sites' LIMIT 1)
WHERE map_id IS NULL;

-- Make map_id NOT NULL and add foreign key after updating
ALTER TABLE nt_sites ALTER COLUMN map_id SET NOT NULL;
ALTER TABLE nt_sites ADD CONSTRAINT fk_map_layers FOREIGN KEY (map_id) REFERENCES map_layers(id);

-- Add custom_data JSONB to nt_sites
ALTER TABLE nt_sites ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}'::jsonb;

COMMIT;
