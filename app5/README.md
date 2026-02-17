# Preventive Maintenance System (PMS)

A comprehensive dashboard for managing preventive maintenance and site surveys.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Docker Compose, Nginx

## Prerequisite
- Docker and Docker Compose installed.

## How to Run

1. **Start the application**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   Open [http://localhost](http://localhost) in your browser.

3. **Seed Initial Data** (Optional):
   To populate the database with sample data:
   ```bash
   docker-compose exec backend npm run seed
   ```

## Development
- **Frontend**: `npm run dev` (Port 5173 - requires backend running on 3000)
- **Backend**: `cd server && npm run start` (Port 3000)
