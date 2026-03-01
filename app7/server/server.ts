import express from "express";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.NODE_ENV === 'production' ? '/app/survey.db' : 'survey.db';
const db = new Database(dbPath);

console.log(`Connecting to database at: ${dbPath}`);

const app = express();
const PORT = 3010;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("App7 Backend is UP");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/filters", (req, res) => {
  console.log("GET /api/filters");
  try {
    const provinces = db.prepare("SELECT DISTINCT province FROM sites ORDER BY province").all();
    const districts = db.prepare("SELECT DISTINCT province, district FROM sites ORDER BY province, district").all();
    res.json({ provinces, districts });
  } catch (err: any) {
    console.error("Filters Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/sites", (req, res) => {
  console.log("GET /api/sites", req.query);
  try {
    const {
      province, district, status, search,
      minLat, maxLat, minLng, maxLng,
      page, limit, fields
    } = req.query;

    let selectClause = "*";
    if (fields === "map") {
      selectClause = "id, request_id, circuit_id, location, latitude, longitude, is_surveyed, survey_cost, survey_notes, has_consumer_unit, has_ground_rod, consumer_unit_cost, ground_rod_cost, main_wire_rate, main_wire_length, labor_cost, district, province";
    }

    let query = "FROM sites WHERE 1=1";
    const params: any[] = [];

    if (province) { query += " AND province = ?"; params.push(province); }
    if (district) { query += " AND district = ?"; params.push(district); }
    if (status === "surveyed") { query += " AND is_surveyed = 1"; }
    else if (status === "pending") { query += " AND is_surveyed = 0"; }

    if (search) {
      query += " AND (location LIKE ? OR request_id LIKE ? OR circuit_id LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (minLat && maxLat && minLng && maxLng) {
      query += " AND latitude >= ? AND latitude <= ? AND longitude >= ? AND longitude <= ?";
      params.push(Number(minLat), Number(maxLat), Number(minLng), Number(maxLng));
    }

    const totalCountResult = db.prepare(`SELECT COUNT(*) as count, AVG(latitude) as avgLat, AVG(longitude) as avgLng ${query}`).get(...params) as any;
    const totalCount = totalCountResult.count;
    const center = totalCount > 0 ? [totalCountResult.avgLat, totalCountResult.avgLng] : null;

    if (page && limit) {
      query += " LIMIT ? OFFSET ?";
      params.push(Number(limit), (Number(page) - 1) * Number(limit));
    } else if (!minLat) {
      // Default safety limit for broad queries (higher for map view)
      const safetyLimit = fields === "map" ? 4001 : 1000;
      query += ` LIMIT ${safetyLimit}`;
    }

    const sites = db.prepare(`SELECT ${selectClause} ${query}`).all(...params);
    res.json({ sites, totalCount, center });
  } catch (err: any) {
    console.error("Sites Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/survey/:id", (req, res) => {
  const { id } = req.params;
  const { cost, notes, consumerUnitCost, groundRodCost, mainWireRate, mainWireLength, laborCost } = req.body;
  const date = new Date().toISOString();

  try {
    const result = db.prepare(`
      UPDATE sites 
      SET survey_cost = ?, survey_notes = ?, survey_date = ?, is_surveyed = 1,
          consumer_unit_cost = ?, ground_rod_cost = ?, main_wire_rate = ?, 
          main_wire_length = ?, labor_cost = ?
      WHERE id = ?
    `).run(cost, notes, date, consumerUnitCost, groundRodCost, mainWireRate, mainWireLength, laborCost, id);
    res.json({ success: result.changes > 0 });
  } catch (err: any) {
    console.error("Survey Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
