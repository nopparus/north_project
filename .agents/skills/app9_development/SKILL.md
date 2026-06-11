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
  - `AdminPanel`: Handles the main admin layout with folder-tab navigation (`AdminMasterDatasetsTab`, `AdminProjectsTab`).
  - `AdminMasterDatasetsTab`: Replaces the legacy OLT tab. Allows admins to upload and manage multiple independent master datasets (JSONB), defining dataset names and custom primary keys.
  - `AdminProjectsTab`: Manages the dynamic creation of survey projects. Admins can select a specific **Source Master Dataset** during creation, parse Excel files, and configure the schema (Editable, Visible, Use as Filter).
  - `ProjectView`: The surveyor interface. Dynamically fetches and displays Master Data (`master_data_records`) based on the project's linked dataset. Includes "Site Relocation" feature allowing users to change the target IP address, maintaining relocation history.
- **Routing**: `react-router-dom` (`/admin`, `/project/:id`).

### Backend (`app9-backend`)
- **Tech Stack**: Node.js, Express, `pg` (PostgreSQL), `multer` (for file uploads), `exceljs` & `xlsx` (for Excel parsing/exporting).
- **Core Endpoints**:
  - `GET /api/master-datasets` & `POST /api/master-datasets`: Manage dynamic master datasets. Automatically parses uploaded files into JSONB records.
  - `POST /api/create-survey-project`: Creates a new project linked to a `master_dataset_id` and inserts survey tasks.
  - `GET /api/projects/:id/tasks`: Fetches survey tasks, dynamically joined with `master_data_records` (returns `master_data` JSONB object).
  - `POST /api/tasks/:id/change-site`: Executes a transactional site relocation, optionally swapping tasks if the target IP is already assigned, and records relocation history in `survey_data`.
  - `POST /api/tasks/:id/revert-site`: Reverts a site relocation, restoring the original IP and clearing history.

### Database Schema (`app9-db` PostgreSQL)
- **`master_datasets`**: 
  - `id` (UUID PK), `dataset_name`, `primary_key_column`, `schema_config` (JSONB).
- **`master_data_records`**: 
  - `id` (UUID PK), `dataset_id` (FK to master_datasets), `primary_key_value` (String), `data` (JSONB). Replaces `olt_base_data` to support dynamic, multi-project data sources.
- **`survey_projects`**: 
  - `project_id` (PK), `project_name`, `display_mode` ('form' | 'table'), `master_dataset_id` (UUID FK), `form_schema` (JSONB).
- **`survey_tasks`**:
  - `task_id` (PK), `project_id` (FK), `ip_address`, `ne_name`, `survey_data` (JSONB).
- **`task_history`**: Tracks site relocation history to prevent nested/chained moves.

## Docker Setup
- **Network**: Traefik handles routing via `nexus-app9`.
- **Services**:
  - `app9-frontend`: Runs Vite build output via Nginx.
  - `app9-backend`: Node API server running on port 3009.
  - `app9-db`: PostgreSQL server on port 5432.
- **Command**: `docker compose -f docker-compose.app9.yml up -d --build`

## Development Notes & Best Practices
1. **Dynamic Master Data**: The system has migrated from a fixed `olt_base_data` table to a highly flexible `master_data_records` JSONB structure. This allows independent surveys to utilize entirely different baseline datasets without altering SQL schemas.
2. **Site Relocation Integrity**: The `change-site` and `revert-site` features utilize PostgreSQL transactions (`BEGIN`/`COMMIT`) to ensure data consistency during complex IP swaps.
3. **Data Exporting**: Uses `exceljs` to generate native Excel Tables (`sheet.addTable`), providing users with built-in sorting/filtering functionality.
4. **Table UX Components**: All major data tables utilize custom hooks (`usePagination` and `useDraggableScroll`) to support high-performance rendering of large datasets and enable horizontal mouse-drag scrolling without visible scrollbars.
### UI Guidelines
- **Standard Header Size**: All primary headers across the application (Admin Panel, Main Menu, Project View) MUST use the standard `px-6 py-3` padding and `sticky top-0 z-50 backdrop-blur-sm shadow-xl` class to maintain a consistent height of exactly `56.88px`.
  - Class: `sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-xl gap-4`
  - Avoid using `flex-col` on inner elements that could increase the header height beyond 56px.

### Recent Implementations (June 2026)
1. **Auto-Save Functionality**: Replaced manual "Save" buttons with implicit `onBlur` and `onChange` auto-saving mechanism. Survey responses immediately update in the background, showing a non-interactive "Saved Automatically" status.
2. **Checkbox Boolean Support & Filtering Fix**: Corrected logic in the progress bar and UI filters to interpret both text `'true'` and boolean `true`. Checkboxes correctly render ticked states and dynamic filter dropdowns handle missing (`undefined`/`false`) data gracefully.
3. **Progress Calculation Fix**: Addressed bug where the progress completion percentage (e.g., 100%) was incorrectly calculated based on the *currently filtered* items. It now accurately reflects `(completedTasks / totalTasksInProject)`.
4. **User-Project Access Control**: Implemented `allowed_projects` (JSONB) in the `users` table. The Admin User Management view allows assigning specific `survey_projects` to Surveyor roles via checkboxes. Non-admins have their GET `/projects` and GET `/projects/:id` endpoints securely filtered to only return data for their assigned projects.
