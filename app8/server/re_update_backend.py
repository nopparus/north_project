import re

filepath = '/home/nopparus2/www/app8/server/index.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add GET /api/all-circuits before app.post('/api/onu-get-olt'
all_circuits_api = """
app.get('/api/all-circuits', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sortField = req.query.sortField || 'id';
    const sortOrder = req.query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const validSortFields = ['id', 'position_dslam', 'system_dslam', 'ip_address', 'circuit', 'name', 'status', 'actual_type', 'sn', 'onu_brand'];
    const finalSort = validSortFields.includes(sortField) ? sortField : 'id';

    try {
        const queryText = `
            SELECT a.*, d.brand as mapped_brand, d.model as mapped_model
            FROM all_circuits a
            LEFT JOIN cpe_devices d ON a.actual_type = d.raw_name
            WHERE (
                a.circuit ILIKE $3 OR 
                a.name ILIKE $3 OR 
                a.actual_type ILIKE $3 OR
                a.sn ILIKE $3 OR
                a.ip_address ILIKE $3
            )
            ORDER BY a.${finalSort} ${sortOrder}
            LIMIT $1 OFFSET $2
        `;
        const countQueryText = `
            SELECT COUNT(*) FROM all_circuits 
            WHERE (
                circuit ILIKE $1 OR 
                name ILIKE $1 OR 
                actual_type ILIKE $1 OR
                sn ILIKE $1 OR
                ip_address ILIKE $1
            )
        `;

        const result = await pool.query(queryText, [limit, offset, `%${search}%`]);
        const countResult = await pool.query(countQueryText, [`%${search}%`]);

        res.json({
            data: result.rows,
            total: parseInt(countResult.rows[0].count)
        });
    } catch (err) {
        console.error('Error fetching all_circuits:', err);
        res.status(500).json({ message: err.message });
    }
});
"""

content = content.replace("app.post('/api/onu-get-olt', authenticate, async (req, res) => {", 
                          all_circuits_api + "\napp.post('/api/onu-get-olt', authenticate, async (req, res) => {")


# Add GET /api/all-circuits-groups before app.get('/api/onu-get-olt-groups/export'
all_circuits_groups_api = """
app.get('/api/all-circuits-groups', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query.sortField || 'raw_name';
    const sortOrder = req.query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const validSortFields = ['raw_name', 'brand', 'model', 'record_count'];
    const finalSort = validSortFields.includes(sortField) ? sortField : 'raw_name';

    const search = req.query.search || '';
    const searchPattern = `%${search}%`;
    const pendingOnly = req.query.pendingOnly === 'true';

    try {
        let countQuery = `
            SELECT COUNT(DISTINCT actual_type) as total 
            FROM all_circuits 
            WHERE (actual_type IS NOT NULL AND actual_type != '')
            AND (actual_type ILIKE $1)
        `;
        if (pendingOnly) {
            countQuery = `
                SELECT COUNT(DISTINCT o.actual_type) as total 
                FROM all_circuits o
                LEFT JOIN cpe_devices d ON o.actual_type = d.raw_name
                WHERE (o.actual_type IS NOT NULL AND o.actual_type != '')
                AND (o.actual_type ILIKE $1)
                AND d.id IS NULL
            `;
        }
        const countResult = await pool.query(countQuery, [searchPattern]);
        const total = parseInt(countResult.rows[0].total);

        const result = await pool.query(`
            WITH raw_groups AS (
                SELECT 
                    TRIM(REGEXP_REPLACE(actual_type, '[\\r\\n\\t\\s]+', ' ', 'g')) as raw_name, 
                    COUNT(*)::integer as record_count 
 
                FROM all_circuits 
                WHERE (actual_type IS NOT NULL AND actual_type != '')
                GROUP BY 1
            ),
            joined AS (
                SELECT g.raw_name, g.record_count, d.brand, d.model, d.id as mapped_id
                FROM raw_groups g
                LEFT JOIN cpe_devices d ON g.raw_name = d.raw_name
            )
            SELECT * FROM joined
            WHERE (raw_name ILIKE $3 OR brand ILIKE $3 OR model ILIKE $3)
            ${pendingOnly ? ' AND mapped_id IS NULL' : ''}
            ORDER BY ${finalSort} ${sortOrder} NULLS LAST
            LIMIT $1 OFFSET $2
        `, [limit, offset, searchPattern]);
        res.json({ data: result.rows, total });
    } catch (err) {
        console.error('Error fetching all circuits groups:', err);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/all-circuits-groups/new-discoveries', authenticate, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT TRIM(REGEXP_REPLACE(o.actual_type, '[\\r\\n\\t\\s]+', ' ', 'g')) as raw_name
            FROM all_circuits o
            LEFT JOIN cpe_devices c ON TRIM(REGEXP_REPLACE(o.actual_type, '[\\r\\n\\t\\s]+', ' ', 'g')) = c.raw_name
            WHERE o.actual_type IS NOT NULL 
              AND o.actual_type != '' 
              AND c.id IS NULL
            ORDER BY raw_name ASC
            LIMIT 50
        `);
        res.json({ data: result.rows });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
"""

content = content.replace("app.get('/api/onu-get-olt-groups/export', authenticate, async (req, res) => {",
                          all_circuits_groups_api + "\napp.get('/api/onu-get-olt-groups/export', authenticate, async (req, res) => {")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Restored API endpoints to index.js")
