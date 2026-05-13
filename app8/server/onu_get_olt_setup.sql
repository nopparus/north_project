
CREATE TABLE IF NOT EXISTS onu_get_olt (
    id SERIAL PRIMARY KEY,
    c1 text, c2 text, c3 text, c4 text, c5 text, c6 text, c7 text, c8 text, c9 text, c10 text,
    c11 text, c12 text, c13 text, c14 text, c15 text, c16 text, c17 text, c18 text, c19 text, c20 text,
    c21 text, c22 text, c23 text, c24 text, c25 text, c26 text, c27 text, c28 text, c29 text, c30 text,
    c31 text, c32 text, c33 text, c34 text, c35 text, c36 text, c37 text, c38 text, c39 text, c40 text,
    c41 text, c42 text, c43 text,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_onu_get_olt_c1 ON onu_get_olt(c1);
CREATE INDEX IF NOT EXISTS idx_onu_get_olt_c2 ON onu_get_olt(c2);
CREATE INDEX IF NOT EXISTS idx_onu_get_olt_c9 ON onu_get_olt(c9);
CREATE INDEX IF NOT EXISTS idx_onu_get_olt_c15 ON onu_get_olt(c15);
