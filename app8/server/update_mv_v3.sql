-- Update Materialized View to include numeric speeds, fe_only flag and more indexes for performance
DROP MATERIALIZED VIEW IF EXISTS mv_circuit_summary CASCADE;

CREATE MATERIALIZED VIEW mv_circuit_summary AS
WITH
-- 1. Normalize ONU Records circuits
onu_base AS (
    SELECT
        SPLIT_PART(circuit_id, '@', 1) as circuit_norm,
        circuit_id as circuit_raw,
        installation_close_date,
        speed,
        cpe_brand_model,
        service_name,
        service_status,
        price,
        section,
        province
    FROM onu_records
    WHERE circuit_id IS NOT NULL AND circuit_id != ''
),
-- 2. Normalize ONU Get OLT circuits
olt_base AS (
    SELECT
        SPLIT_PART(service, '@', 1) as circuit_norm,
        service as circuit_raw,
        onu_actual_type
    FROM onu_get_olt
    WHERE service IS NOT NULL AND service != ''
),
-- 3. Normalize All Circuits
all_circuits_base AS (
    SELECT
        circuit as circuit_norm,
        circuit as circuit_raw,
        actual_type as ac_actual_type
    FROM all_circuits
    WHERE circuit IS NOT NULL AND circuit != ''
),
-- 4. Normalize WiFi Router circuits
wifi_base AS (
    SELECT
        SPLIT_PART(circuit_id, '@', 1) as circuit_norm,
        circuit_id as circuit_raw,
        brand as wifi_raw_brand,
        model as wifi_raw_model
    FROM wifi_routers
    WHERE circuit_id IS NOT NULL AND circuit_id != ''
),
-- 5. All unique circuits across all tables (ONU Records ONLY)
distinct_circuits AS (
    SELECT DISTINCT circuit_norm FROM onu_base
),
-- 6. ONU CPE mapping (from ONU Records)
onu_mapped AS (
    SELECT DISTINCT ON (o.circuit_norm)
        o.circuit_norm, o.speed, o.service_name, o.service_status, o.installation_close_date,
        NULLIF(SUBSTRING(o.installation_close_date FROM '^([0-9]{4})'), '') as install_year,
        o.cpe_brand_model as onu_raw_name,
        d.brand as onu_brand, d.model as onu_model,
        c.type as onu_type, c.lan_ge, c.lan_fe, c.wifi as onu_wifi_spec,
        c.max_speed as onu_max_speed,
        o.price,
        o.section,
        o.province
    FROM onu_base o
    LEFT JOIN cpe_devices d ON o.cpe_brand_model = d.raw_name
    LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
    ORDER BY o.circuit_norm, o.circuit_raw
),
-- 7. ONU Get OLT mapping
olt_mapped AS (
    SELECT DISTINCT ON (ob.circuit_norm)
        ob.circuit_norm,
        ob.onu_actual_type as olt_raw_name,
        d.brand as olt_brand, d.model as olt_model,
        c.type as olt_type, c.lan_ge as olt_lan_ge, c.lan_fe as olt_lan_fe,
        c.wifi as olt_wifi_spec, c.max_speed as olt_max_speed
    FROM olt_base ob
    LEFT JOIN cpe_devices d ON ob.onu_actual_type = d.raw_name
    LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
    ORDER BY ob.circuit_norm, ob.circuit_raw
),
-- 8. All Circuits mapping
ac_mapped AS (
    SELECT DISTINCT ON (acb.circuit_norm)
        acb.circuit_norm,
        acb.ac_actual_type as ac_raw_name,
        d.brand as ac_brand, d.model as ac_model,
        c.type as ac_type, c.lan_ge as ac_lan_ge, c.lan_fe as ac_lan_fe,
        c.wifi as ac_wifi_spec, c.max_speed as ac_max_speed
    FROM all_circuits_base acb
    LEFT JOIN cpe_devices d ON acb.ac_actual_type = d.raw_name
    LEFT JOIN device_catalog c ON d.brand = c.brand AND d.model = c.model
    ORDER BY acb.circuit_norm, acb.circuit_raw
),
-- 9. WiFi Router mapping
wifi_mapped AS (
    SELECT DISTINCT ON (wb.circuit_norm)
        wb.circuit_norm,
        wb.wifi_raw_brand, wb.wifi_raw_model,
        wm.target_brand as wifi_brand, wm.target_model as wifi_model,
        wc.max_speed as wifi_max_speed
    FROM wifi_base wb
    LEFT JOIN wifi_mappings wm ON wb.wifi_raw_brand = wm.raw_brand AND wb.wifi_raw_model = wm.raw_model
    LEFT JOIN device_catalog wc ON wm.target_brand = wc.brand AND wm.target_model = wc.model
    ORDER BY wb.circuit_norm, wb.circuit_raw
),
-- 10. Source flags per circuit
sources AS (
    SELECT
        dc.circuit_norm,
        CASE WHEN onu.circuit_norm IS NOT NULL THEN true ELSE false END as has_onu,
        CASE WHEN olt.circuit_norm IS NOT NULL THEN true ELSE false END as has_olt,
        CASE WHEN ac.circuit_norm IS NOT NULL THEN true ELSE false END as has_ac,
        CASE WHEN wf.circuit_norm IS NOT NULL  THEN true ELSE false END as has_wifi
    FROM distinct_circuits dc
    LEFT JOIN onu_mapped onu ON dc.circuit_norm = onu.circuit_norm
    LEFT JOIN olt_mapped olt ON dc.circuit_norm = olt.circuit_norm
    LEFT JOIN ac_mapped ac ON dc.circuit_norm = ac.circuit_norm
    LEFT JOIN wifi_mapped wf ON dc.circuit_norm = wf.circuit_norm
),
-- 11. Final assembly with max_speed logic
final_assembly AS (
    SELECT
        dc.circuit_norm,
        onu.speed,
        onu.service_name,
        onu.service_status,
        onu.install_year,
        onu.price,
        onu.section,
        onu.province,
        onu.onu_raw_name as onu_record_cpe,
        olt.olt_raw_name as onu_olt_cpe,
        ac.ac_raw_name as onu_ac_cpe,
        CASE WHEN s.has_ac THEN ac.ac_brand WHEN s.has_olt THEN olt.olt_brand ELSE onu.onu_brand END as onu_brand,
        CASE WHEN s.has_ac THEN ac.ac_model WHEN s.has_olt THEN olt.olt_model ELSE onu.onu_model END as onu_model,
        CASE WHEN s.has_ac THEN ac.ac_type WHEN s.has_olt THEN olt.olt_type ELSE onu.onu_type END as onu_device_type,
        CASE WHEN s.has_ac THEN ac.ac_lan_ge WHEN s.has_olt THEN olt.olt_lan_ge ELSE onu.lan_ge END as onu_lan_ge,
        CASE WHEN s.has_ac THEN ac.ac_lan_fe WHEN s.has_olt THEN olt.olt_lan_fe ELSE onu.lan_fe END as onu_lan_fe,
        CASE WHEN s.has_ac THEN ac.ac_wifi_spec WHEN s.has_olt THEN olt.olt_wifi_spec ELSE onu.onu_wifi_spec END as onu_wifi_spec,
        onu.onu_brand as onu_record_brand,
        onu.onu_model as onu_record_model,
        olt.olt_brand,
        olt.olt_model,
        wf.wifi_raw_brand, wf.wifi_raw_model,
        wf.wifi_brand, wf.wifi_model,
        wf.wifi_max_speed,
        CASE WHEN s.has_ac THEN ac.ac_raw_name WHEN s.has_olt THEN olt.olt_raw_name ELSE onu.onu_raw_name END as onu_raw_name,
        s.has_onu, s.has_olt, s.has_ac, s.has_wifi,
        CASE
            WHEN (CASE WHEN s.has_ac THEN ac.ac_type WHEN s.has_olt THEN olt.olt_type ELSE onu.onu_type END ILIKE '%all in one%' OR CASE WHEN s.has_ac THEN ac.ac_type WHEN s.has_olt THEN olt.olt_type ELSE onu.onu_type END ILIKE '%all-in-one%')
                 AND wf.circuit_norm IS NOT NULL
                 AND wf.wifi_max_speed IS NOT NULL AND wf.wifi_max_speed != ''
                 AND CASE WHEN s.has_ac THEN ac.ac_max_speed WHEN s.has_olt THEN olt.olt_max_speed ELSE onu.onu_max_speed END IS NOT NULL AND CASE WHEN s.has_ac THEN ac.ac_max_speed WHEN s.has_olt THEN olt.olt_max_speed ELSE onu.onu_max_speed END != ''
            THEN 
                 CASE 
                     WHEN COALESCE(CAST(NULLIF(REGEXP_REPLACE(CASE WHEN s.has_ac THEN ac.ac_max_speed WHEN s.has_olt THEN olt.olt_max_speed ELSE onu.onu_max_speed END, '[^0-9.]', '', 'g'), '') AS NUMERIC), 0) > 
                          COALESCE(CAST(NULLIF(REGEXP_REPLACE(wf.wifi_max_speed, '[^0-9.]', '', 'g'), '') AS NUMERIC), 0)
                     THEN CASE WHEN s.has_ac THEN ac.ac_max_speed WHEN s.has_olt THEN olt.olt_max_speed ELSE onu.onu_max_speed END
                     ELSE wf.wifi_max_speed
                 END
            WHEN wf.wifi_max_speed IS NOT NULL AND wf.wifi_max_speed != '' THEN wf.wifi_max_speed
            WHEN (CASE WHEN s.has_ac THEN ac.ac_lan_fe WHEN s.has_olt THEN olt.olt_lan_fe ELSE onu.lan_fe END IS NOT NULL AND CASE WHEN s.has_ac THEN ac.ac_lan_fe WHEN s.has_olt THEN olt.olt_lan_fe ELSE onu.lan_fe END != '' AND CASE WHEN s.has_ac THEN ac.ac_lan_fe WHEN s.has_olt THEN olt.olt_lan_fe ELSE onu.lan_fe END != '0')
                 AND (CASE WHEN s.has_ac THEN ac.ac_lan_ge WHEN s.has_olt THEN olt.olt_lan_ge ELSE onu.lan_ge END IS NULL OR CASE WHEN s.has_ac THEN ac.ac_lan_ge WHEN s.has_olt THEN olt.olt_lan_ge ELSE onu.lan_ge END = '' OR CASE WHEN s.has_ac THEN ac.ac_lan_ge WHEN s.has_olt THEN olt.olt_lan_ge ELSE onu.lan_ge END = '0')
                 THEN '100 Mbps (FE Only)'
            ELSE CASE WHEN s.has_ac THEN ac.ac_max_speed WHEN s.has_olt THEN olt.olt_max_speed ELSE onu.onu_max_speed END
        END as effective_max_speed,
        CASE 
            WHEN wf.circuit_norm IS NULL 
                 AND NOT (COALESCE(CASE WHEN s.has_ac THEN ac.ac_type WHEN s.has_olt THEN olt.olt_type ELSE onu.onu_type END, '') ILIKE '%all in one%')
            THEN true ELSE false 
        END as is_onu_without_wifi
    FROM distinct_circuits dc
    LEFT JOIN onu_mapped onu ON dc.circuit_norm = onu.circuit_norm
    LEFT JOIN olt_mapped olt ON dc.circuit_norm = olt.circuit_norm
    LEFT JOIN ac_mapped ac ON dc.circuit_norm = ac.circuit_norm
    LEFT JOIN wifi_mapped wf ON dc.circuit_norm = wf.circuit_norm
    LEFT JOIN sources s ON dc.circuit_norm = s.circuit_norm
)
SELECT 
    *,
    CASE 
        WHEN speed ILIKE '%k%' THEN 
            COALESCE(CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(speed, '/', 1), '[^0-9.]', '', 'g'), '') AS NUMERIC), 0) / 1024
        ELSE 
            COALESCE(CAST(NULLIF(REGEXP_REPLACE(SPLIT_PART(speed, '/', 1), '[^0-9.]', '', 'g'), '') AS NUMERIC), 0)
    END as speed_mbps,
    COALESCE(CAST(NULLIF(REGEXP_REPLACE(effective_max_speed, '[^0-9.]', '', 'g'), '') AS NUMERIC), 0) as effective_max_speed_mbps,
    CASE 
        WHEN (onu_lan_fe IS NOT NULL AND onu_lan_fe != '' AND onu_lan_fe != '0')
             AND (onu_lan_ge IS NULL OR onu_lan_ge = '' OR onu_lan_ge = '0')
        THEN true ELSE false 
    END as is_fe_only
FROM final_assembly;

-- Indexes for performance
CREATE UNIQUE INDEX idx_mv_circuit_norm ON mv_circuit_summary(circuit_norm);
CREATE INDEX idx_mv_service_name ON mv_circuit_summary(service_name);
CREATE INDEX idx_mv_install_year ON mv_circuit_summary(install_year);
CREATE INDEX idx_mv_onu_brand ON mv_circuit_summary(onu_brand);
CREATE INDEX idx_mv_is_onu_without_wifi ON mv_circuit_summary(is_onu_without_wifi);
CREATE INDEX idx_mv_speed_mbps ON mv_circuit_summary(speed_mbps);
CREATE INDEX idx_mv_max_speed_mbps ON mv_circuit_summary(effective_max_speed_mbps);
CREATE INDEX idx_mv_is_fe_only ON mv_circuit_summary(is_fe_only);
CREATE INDEX idx_mv_service_status ON mv_circuit_summary(service_status);
CREATE INDEX idx_mv_province ON mv_circuit_summary(province);
CREATE INDEX idx_mv_onu_record_cpe ON mv_circuit_summary(onu_record_cpe);
CREATE INDEX idx_mv_onu_olt_cpe ON mv_circuit_summary(onu_olt_cpe);
CREATE INDEX idx_mv_onu_ac_cpe ON mv_circuit_summary(onu_ac_cpe);
