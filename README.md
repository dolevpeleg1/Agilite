# Agilite

Support tickets app with a React + Vite frontend and Node.js + Express API backed by PostgreSQL.

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** (running locally)
- Database `agilite` created (`createdb agilite` or `CREATE DATABASE agilite;` in psql)

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

Configure via environment variables or a `.env` file:

| Variable      | Default   | Description                    |
|---------------|-----------|--------------------------------|
| `DATABASE_URL`| —         | Full PostgreSQL connection string |
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
