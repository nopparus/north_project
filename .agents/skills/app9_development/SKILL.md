---
name: App9 Development Guide and Architecture
description: Comprehensive summary of App9 (Site Survey Pro) architecture, database structure, and development log to avoid re-reading code.
---

# App9: Site Survey Pro - Development Guide & Architecture

## Overview
App9 (Site Survey Pro) is a specialized application designed for **dynamic survey data collection** and **master OLT data management**. It allows administrators to import master OLT data (via CSV/Excel) and create customized survey projects. Surveyors can access these projects, fill out dynamic forms, or interact with an Excel-like table view to submit field data. 

## Key Features
- **Dynamic Form Schema Builder**: Admins can customize the fields generated from Excel headers (change label, type: text/select/checkbox, set visibility and editability).
- **Dual Display Modes**: Surveyors can interact with data via a detail-by-detail "Form View" or a bulk-editable "Table View".
- **Advanced Exporting**: Generates real Excel Table (`exceljs`) files with stylized headers, alternating rows, and auto-filtering capability.
- **Dynamic Filtering**: Admins can mark specific columns as `isFilter: true` to automatically generate dropdown filters for surveyors on the frontend.
- **Minimalist UI**: Utilizes modern, full-width layouts with compact upload zones and clean table styling.

## Architecture

### Frontend (`app9-frontend`)
- **Tech Stack**: React 18, Vite, Tailwind CSS, Lucide React (for icons), Axios.
- **Core Components (`src/App.tsx`)**:
  - `AdminPanel`: Handles the main admin layout with folder-tab navigation (`AdminOltTab`, `AdminProjectsTab`).
  - `AdminProjectsTab`: Manages the dynamic creation of survey projects, including Excel file parsing and schema configuration (Editable, Visible, Use as Filter).
  - `ProjectView`: The surveyor interface that conditionally renders Form or Table mode, applies dynamic filtering, and includes a "View Raw Data" (Eye icon) modal.
  - `AdminOltTab`: Allows admins to upload Master OLT baseline data.
- **Routing**: `react-router-dom` (`/admin`, `/project/:id`).

### Backend (`app9-backend`)
- **Tech Stack**: Node.js, Express, `pg` (PostgreSQL), `multer` (for file uploads), `exceljs` & `xlsx` (for Excel parsing/exporting).
- **Core Endpoints**:
  - `POST /api/upload-olt`: Upserts master OLT data.
  - `POST /api/parse-survey-excel`: Parses an uploaded survey file and extracts headers for schema creation.
  - `POST /api/create-survey-project`: Creates a new project and inserts multiple survey tasks based on the Excel file content.
  - `PUT /api/projects/:id/schema`: Updates a project's dynamic schema configuration.
  - `GET /api/projects/:id/export`: Exports the full project data into a styled Excel table using `exceljs`.
  - `DELETE /api/projects/:id`: Cascading deletion of a project and its tasks.

### Database Schema (`app9-db` PostgreSQL)
- **`olt_base_data`**: Stores the master baseline data for sites (IP, NE Name, Province, etc.).
- **`survey_projects`**: 
  - `project_id` (PK)
  - `project_name`
  - `display_mode` ('form' | 'table')
  - `form_schema` (JSONB): Contains the schema configuration `[{name, label, type, options, editable, visible, isFilter}]`.
- **`survey_tasks`**:
  - `task_id` (PK)
  - `project_id` (FK to survey_projects)
  - `ip_address`
  - `ne_name`
  - `survey_data` (JSONB): Contains all parsed row data from Excel.

## Docker Setup
- **Network**: Traefik handles routing via `nexus-app9`.
- **Services**:
  - `app9-frontend`: Runs Vite build output via Nginx (Port 80/443).
  - `app9-backend`: Node API server running on port 5009.
  - `app9-db`: PostgreSQL server on port 5439.
- **Command**: `docker compose -f docker-compose.app9.yml up -d --build`

## Development Notes & Best Practices
1. **Dynamic Schema Mutability**: The `form_schema` JSON is the source of truth for rendering fields. Always validate updates to `visible`, `editable`, and `isFilter` flags.
2. **Payload Size**: Excel file uploads can be large. Express `body-parser` limits have been increased to `50mb` in `server.js` to avoid `413 Payload Too Large` errors.
3. **Data Export**: We migrated from the basic `xlsx` package to `exceljs` for the export endpoint to support native Excel table creation (`sheet.addTable`), which gives users built-in sorting and filtering in Excel.
4. **UI Philosophy**: The UI favors full-width containers (`w-full`) to accommodate data-heavy tables. Form controls and padding in tables should be kept minimal (`px-3 py-1`) to maximize visible information without scrolling.
