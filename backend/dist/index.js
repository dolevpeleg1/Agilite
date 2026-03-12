import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { randomBytes } from 'crypto';
const app = express();
const PORT = process.env.PORT ?? 3001;
app.use(cors());
app.use(express.json());
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ...(process.env.DATABASE_URL
        ? {}
        : {
            host: process.env.PG_HOST ?? 'localhost',
            port: Number(process.env.PG_PORT) || 5432,
            user: process.env.PG_USER ?? 'postgres',
            password: process.env.PG_PASSWORD ?? 'postgres',
            database: process.env.PG_DATABASE ?? 'agilite',
        }),
});
async function initDb() {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        "productId" INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        "createdAt" TEXT NOT NULL
      )
    `);
    }
    finally {
        client.release();
    }
}
function generateTicketId() {
    return `TKT-${randomBytes(4).toString('hex').toUpperCase()}`;
}
function toTicket(row) {
    return {
        id: row.id,
        email: row.email,
        name: row.name,
        subject: row.subject,
        message: row.message,
        productId: row.productId,
        status: row.status,
        createdAt: row.createdAt,
    };
}
// POST /api/tickets - create ticket
app.post('/api/tickets', async (req, res) => {
    try {
        const { email, name, subject, message, productId } = req.body;
        if (!email || !name || !subject || !message || productId == null) {
            res.status(400).json({
                message: 'Missing required fields: email, name, subject, message, productId',
            });
            return;
        }
        const id = generateTicketId();
        const status = 'open';
        const createdAt = new Date().toISOString();
        await pool.query(`INSERT INTO tickets (id, email, name, subject, message, "productId", status, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [id, email, name, subject, message, productId, status, createdAt]);
        const { rows } = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
        res.status(201).json(toTicket(rows[0]));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// GET /api/tickets - list all tickets (newest first)
app.get('/api/tickets', async (_req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM tickets ORDER BY "createdAt" DESC');
        res.json(rows.map(toTicket));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
initDb()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Backend running at http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error('Database init failed:', err);
    process.exit(1);
});
