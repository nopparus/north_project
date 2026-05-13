-- App8 Database Schema
-- Last updated: 2026-05-08

-- Tables
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

CREATE TABLE IF NOT EXISTS onu_records (
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

CREATE TABLE IF NOT EXISTS onu_records_backup (
    id INTEGER,
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
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cpe_devices (
    id SERIAL PRIMARY KEY,
    raw_name TEXT UNIQUE NOT NULL,
    brand TEXT,
    model TEXT,
    version TEXT,
    type TEXT,
    lan_ge TEXT,
    lan_fe TEXT,
    wifi TEXT,
    usage TEXT,
    grade TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS device_catalog (
    id SERIAL PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    type TEXT,
    version TEXT,
    lan_ge TEXT,
    lan_fe TEXT,
    wifi TEXT,
    usage TEXT,
    grade TEXT,
    price DECIMAL(12,2),
    max_speed TEXT,
    UNIQUE(brand, model),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS device_catalog_backup (
    id INTEGER,
    brand TEXT,
    model TEXT,
    type TEXT,
    version TEXT,
    lan_ge TEXT,
    lan_fe TEXT,
    wifi TEXT,
    usage TEXT,
    grade TEXT,
    price DECIMAL(12,2),
    max_speed TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wifi_routers (
    id SERIAL PRIMARY KEY,
    circuit_id TEXT,
    brand TEXT,
    model TEXT,
    version TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wifi_routers_backup (
    id INTEGER,
    circuit_id TEXT,
    brand TEXT,
    model TEXT,
    version TEXT,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wifi_mappings (
    id SERIAL PRIMARY KEY,
    raw_brand TEXT NOT NULL,
    raw_model TEXT NOT NULL,
    target_brand TEXT NOT NULL,
    target_model TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(raw_brand, raw_model)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_onu_circuit_id ON onu_records (circuit_id);
CREATE INDEX IF NOT EXISTS idx_onu_cpe_model ON onu_records (cpe_brand_model);
CREATE INDEX IF NOT EXISTS idx_wifi_circuit_id ON wifi_routers (circuit_id);
