-- Updated Schema for App8 with all ONU columns
-- Increased field lengths to TEXT to accommodate long values

DROP TABLE IF EXISTS onu_records CASCADE;

CREATE TABLE onu_records (
    id SERIAL PRIMARY KEY,
    installation_close_date TEXT,
    request_id TEXT,
    circuit_id TEXT,
    province TEXT,
    main_service TEXT,
    speed TEXT,
    price DECIMAL(12,2),
    service_name TEXT,
    promotion_start_date TEXT,
    section TEXT,
    exchange TEXT,
    cpe_brand_model TEXT,
    olt_brand_model TEXT,
    cpe_status TEXT,
    service_status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users and Logs remain same
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New Table for CPE Device Mapping
CREATE TABLE IF NOT EXISTS cpe_devices (
    id SERIAL PRIMARY KEY,
    raw_name TEXT UNIQUE NOT NULL,
    brand TEXT,
    model TEXT,
    version TEXT,
    onu_type TEXT,
    lan_ge TEXT,
    lan_fe TEXT,
    wifi TEXT,
    usage TEXT,
    grade TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New Table for Device Catalog (Specs)
CREATE TABLE IF NOT EXISTS device_catalog (
    id SERIAL PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    lan_ge TEXT,
    lan_fe TEXT,
    wifi TEXT,
    UNIQUE(brand, model),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
