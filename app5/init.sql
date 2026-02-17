CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    equipment_types JSONB,
    work_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province VARCHAR(100) NOT NULL,
    site_name VARCHAR(255) NOT NULL,
    num_facilities INTEGER DEFAULT 0,
    num_generators INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    work_type VARCHAR(50),
    site_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    equipment_type VARCHAR(100),
    date DATE NOT NULL,
    inspector VARCHAR(255) NOT NULL,
    co_inspector VARCHAR(255),
    status VARCHAR(50),
    data JSONB,
    notes TEXT,
    condition_rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    equipment_type VARCHAR(100),
    start_month INTEGER,
    duration INTEGER,
    label VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
