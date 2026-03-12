# Agilite

Support tickets app with a React + Vite frontend and Node.js + Express API backed by PostgreSQL.

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** — either [Neon](https://neon.tech) (recommended) or local

## Database: Neon

This project uses [Neon](https://neon.tech) for serverless PostgreSQL.

1. Create a free account at [console.neon.tech](https://console.neon.tech)
2. Create a project (e.g. Postgres 16 or 17)
3. Copy the connection string from **Connection details**
4. Create `backend/.env`:
   ```
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   ```
5. The backend creates the `tickets` table on first run

To view your data in Neon: open the project → **SQL Editor** → run `SELECT * FROM tickets;`

## Quick Start

```bash
npm install
npm run dev
```

This installs dependencies for both frontend and backend, then starts both servers:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## Manual Setup

### Backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` (from Neon or your PostgreSQL provider).

| Variable      | Default   | Description                    |
|---------------|-----------|--------------------------------|
| `DATABASE_URL`| —         | Full PostgreSQL connection string (e.g. Neon) |
| `PG_HOST`     | localhost | PostgreSQL host                |
| `PG_PORT`     | 5432      | PostgreSQL port                |
| `PG_USER`     | postgres  | PostgreSQL user                |
| `PG_PASSWORD` | postgres  | PostgreSQL password            |
| `PG_DATABASE` | agilite   | Database name                  |
| `PORT`        | 3001      | API server port                |

```bash
npm run dev   # Development
# or
npm run build && npm start   # Production
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173 and proxies API requests to the backend.
