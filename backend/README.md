# Agilite Backend

Node.js + Express API for support tickets. Uses PostgreSQL for storage.

## Prerequisites

- Node.js 18+
- PostgreSQL

## Database Setup

Create a database:

```bash
createdb agilite
```

Or with psql:

```sql
CREATE DATABASE agilite;
```

## Environment

Configure via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | Full connection string (overrides below) |
| `PG_HOST` | localhost | PostgreSQL host |
| `PG_PORT` | 5432 | PostgreSQL port |
| `PG_USER` | postgres | PostgreSQL user |
| `PG_PASSWORD` | postgres | PostgreSQL password |
| `PG_DATABASE` | agilite | PostgreSQL database name |
| `PORT` | 3001 | API server port |

Example with `.env`:

```
PG_USER=postgres
PG_PASSWORD=postgres
PG_DATABASE=agilite
```

## Setup

```bash
npm install
```

## Run

```bash
# Development (TypeScript, file watch)
npm run dev

# Production (build then run)
npm run build
npm start
```

Server runs on `http://localhost:3001` by default.

## API

### POST /api/tickets

Create a ticket. Body: `{ email, name, subject, message, productId }`

### GET /api/tickets

List all tickets, newest first.
