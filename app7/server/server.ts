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
      page, limit, fields, sort, order
    } = req.query;

    let selectClause = "*";
    if (fields === "map") {
      // Include ALL fields necessary for popups and modals to prevent empty data
      selectClause = "id, request_id, circuit_id, location, latitude, longitude, is_surveyed, " +
        "survey_cost, survey_notes, has_consumer_unit, has_ground_rod, " +
        "consumer_unit_cost, ground_rod_cost, main_wire_rate, main_wire_length, " +
        "labor_cost, district, province, sub_district";
    }

    let query = "FROM sites WHERE 1=1";
    const params: any[] = [];

    if (province) { query += " AND province = ?"; params.push(province); }
    if (district) { query += " AND district = ?"; params.push(district); }
    if (status === "surveyed") { query += " AND is_surveyed = 1 AND survey_cost > 0"; }
    else if (status === "pending") { query += " AND (is_surveyed = 0 OR survey_cost IS NULL OR survey_cost = 0)"; }

    if (search) {
      query += " AND (location LIKE ? OR request_id LIKE ? OR circuit_id LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (minLat && maxLat && minLng && maxLng) {
      query += " AND latitude >= ? AND latitude <= ? AND longitude >= ? AND longitude <= ?";
      params.push(Number(minLat), Number(maxLat), Number(minLng), Number(maxLng));
    }

    const summaryResult = db.prepare(`
      SELECT 
        COUNT(*) as count, 
        SUM(CASE WHEN is_surveyed = 1 AND survey_cost > 0 THEN 1 ELSE 0 END) as surveyedCount,
        SUM(survey_cost) as totalCost, 
        AVG(latitude) as avgLat, 
        AVG(longitude) as avgLng 
      ${query}
    `).get(...params) as any;
    const totalCount = summaryResult.count;
    const surveyedCount = summaryResult.surveyedCount || 0;
    const totalCost = summaryResult.totalCost || 0;
    const center = totalCount > 0 ? [summaryResult.avgLat, summaryResult.avgLng] : null;

    if (sort) {
      const allowedFields = ["request_id", "circuit_id", "location", "district", "province", "survey_cost", "is_surveyed"];
      const finalSort = allowedFields.includes(sort as string) ? sort : "id";
      const finalOrder = order === "desc" ? "DESC" : "ASC";
      query += ` ORDER BY ${finalSort} ${finalOrder}`;
    }

    if (page && limit) {
      query += " LIMIT ? OFFSET ?";
      params.push(Number(limit), (Number(page) - 1) * Number(limit));
    } else if (!minLat) {
      // Default safety limit for broad queries (higher for map view)
      const safetyLimit = fields === "map" ? 4001 : 1000;
      query += ` LIMIT ${safetyLimit}`;
    }

    const sites = db.prepare(`SELECT ${selectClause} ${query}`).all(...params).map((s: any) => ({
      ...s,
      // Force is_surveyed to 0 if cost is 0 or null as requested
      is_surveyed: (s.is_surveyed === 1 && s.survey_cost > 0) ? 1 : 0
    }));
    res.json({ sites, totalCount, surveyedCount, totalCost, center });
  } catch (err: any) {
    console.error("Sites Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/dashboard/summary", (req, res) => {
  console.log("GET /api/dashboard/summary", req.query);
  try {
    const { province, district, status, search } = req.query;

    let query = "FROM sites WHERE 1=1";
    const params: any[] = [];

    if (province) { query += " AND province = ?"; params.push(province); }
    if (district) { query += " AND district = ?"; params.push(district); }
    if (status === "surveyed") { query += " AND is_surveyed = 1 AND survey_cost > 0"; }
    else if (status === "pending") { query += " AND (is_surveyed = 0 OR survey_cost IS NULL OR survey_cost = 0)"; }

    if (search) {
      query += " AND (location LIKE ? OR request_id LIKE ? OR circuit_id LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // 1. Overview metrics
    const summaryResult = db.prepare(`
      SELECT 
        COUNT(*) as totalSites, 
        SUM(CASE WHEN is_surveyed = 1 AND survey_cost > 0 THEN 1 ELSE 0 END) as surveyedSites,
        SUM(survey_cost) as totalBudget,
        SUM(labor_cost) as totalLaborCost,
        SUM(main_wire_length * main_wire_rate) as totalWireCost,
        SUM(consumer_unit_cost) as totalConsumerCost,
        SUM(ground_rod_cost) as totalGroundRodCost
      ${query}
    `).get(...params) as any;

    // 2. Dynamic Grouping (Drill-down: District if Province is selected, otherwise Province)
    const groupField = province ? "district" : "province";
    const groupedData = db.prepare(`
      SELECT 
        ${groupField} as name,
        COUNT(*) as count,
        SUM(CASE WHEN is_surveyed = 1 AND survey_cost > 0 THEN 1 ELSE 0 END) as surveyed,
        SUM(survey_cost) as totalCost,
        SUM(survey_cost) / NULLIF(SUM(CASE WHEN is_surveyed = 1 AND survey_cost > 0 THEN 1 ELSE 0 END), 0) as avgCost
      ${query}
      GROUP BY ${groupField}
      ORDER BY totalCost DESC
    `).all(...params);

    // 3. Time-Series Data (Survey progression over time)
    const timeSeriesData = db.prepare(`
      SELECT 
        date(survey_date) as date,
        COUNT(*) as count,
        SUM(survey_cost) as cost
      ${query} AND is_surveyed = 1 AND survey_date IS NOT NULL
      GROUP BY date(survey_date)
      ORDER BY date(survey_date) ASC
    `).all(...params);

    // 4. Top 5 Most Expensive Sites (Anomalies)
    const expensiveSites = db.prepare(`
      SELECT 
        id, request_id, location, province, district, survey_cost, labor_cost, 
        (main_wire_length * main_wire_rate) as wire_cost, consumer_unit_cost, ground_rod_cost
      ${query} AND is_surveyed = 1 AND survey_cost > 0
      ORDER BY survey_cost DESC
      LIMIT 5
    `).all(...params);

    res.json({
      metrics: {
        totalSites: summaryResult.totalSites || 0,
        surveyedSites: summaryResult.surveyedSites || 0,
        totalBudget: summaryResult.totalBudget || 0,
        totalLaborCost: summaryResult.totalLaborCost || 0,
        totalWireCost: summaryResult.totalWireCost || 0,
        totalConsumerCost: summaryResult.totalConsumerCost || 0,
        totalGroundRodCost: summaryResult.totalGroundRodCost || 0,
      },
      groupedData,
      timeSeriesData,
      expensiveSites
    });

  } catch (err: any) {
    console.error("Dashboard Summary Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/survey/:id", (req, res) => {
  const { id } = req.params;
  const { cost, notes, consumerUnitCost, groundRodCost, mainWireRate, mainWireLength, laborCost } = req.body;
  const date = new Date().toISOString();

  try {
    // If cost is 0 or null, set is_surveyed to 0 (pending)
    const isSurveyed = (cost && parseFloat(cost) > 0) ? 1 : 0;

    const result = db.prepare(`
      UPDATE sites 
      SET survey_cost = ?, survey_notes = ?, survey_date = ?, is_surveyed = ?,
          consumer_unit_cost = ?, ground_rod_cost = ?, main_wire_rate = ?, 
          main_wire_length = ?, labor_cost = ?
      WHERE id = ?
    `).run(cost, notes, date, isSurveyed, consumerUnitCost, groundRodCost, mainWireRate, mainWireLength, laborCost, id);
    res.json({ success: result.changes > 0 });
  } catch (err: any) {
    console.error("Survey Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
