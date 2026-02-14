CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_type TEXT,
    material_code TEXT,
    material_name TEXT,
    category TEXT,
    unit TEXT,
    unit_price REAL DEFAULT 0,
    cable_unit_price REAL DEFAULT 0,
    labor_unit_price REAL DEFAULT 0,
    action_type TEXT,
    spec_brand TEXT,
    remark TEXT,
    symbol_group TEXT
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    created_at TEXT,
    state TEXT, 
    province TEXT,
    budget_year TEXT,
    area TEXT,
    work_type TEXT
);

CREATE TABLE IF NOT EXISTS custom_icons (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    dots TEXT,
    data_url TEXT,
    associated_category TEXT,
    is_system INTEGER DEFAULT 0,
    icon_group TEXT,
    sort_order INTEGER DEFAULT 0,
    allow_sub_materials INTEGER DEFAULT 0
);
