CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS olt_base_data (
    no TEXT,
    operator TEXT,
    node_status TEXT,
    life TEXT,
    asset TEXT,
    province TEXT,
    service_center TEXT,
    brand TEXT,
    ne_ip TEXT PRIMARY KEY,
    ne_name TEXT,
    ne_type TEXT,
    bandwidth TEXT,
    used_port TEXT,
    free_port TEXT,
    total TEXT,
    battery_life TEXT,
    type TEXT,
    pon_type TEXT,
    olt_slot TEXT,
    platform TEXT,
    name_umbo TEXT,
    customer_umbo TEXT,
    olt_twin TEXT,
    procurement_olt TEXT,
    procurement_battery_li_on TEXT,
    battery_site TEXT,
    asset_battery TEXT,
    umbo_id TEXT,
    umbo_location_name TEXT,
    latitude TEXT,
    longitude TEXT,
    asset_code VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sites (
    ip_address VARCHAR(50) PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE survey_projects (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name VARCHAR(255) NOT NULL,
    form_schema JSONB NOT NULL,
    display_mode VARCHAR(20) DEFAULT 'form',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE survey_tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES survey_projects(project_id) ON DELETE CASCADE,
    ip_address VARCHAR(50) REFERENCES sites(ip_address) ON DELETE CASCADE,
    survey_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'Pending',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, ip_address)
);

-- Seed with some dummy data for testing
INSERT INTO sites (ip_address, site_name, location) VALUES 
('192.168.1.1', 'Site A (Headquarters)', 'Bangkok'),
('192.168.1.2', 'Site B (Branch 1)', 'Chiang Mai');
