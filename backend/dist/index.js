import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { z } from 'zod';
const ticketCreateSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .max(255, 'Email is too long')
        .email('Invalid email address'),
    name: z
        .string()
        .min(1, 'Name is required')
        .max(255, 'Name is too long')
        .transform((s) => s.trim()),
    subject: z
        .string()
        .min(1, 'Subject is required')
        .max(500, 'Subject is too long')
        .transform((s) => s.trim()),
    message: z
        .string()
        .min(1, 'Message is required')
        .max(10000, 'Message is too long')
        .transform((s) => s.trim()),
    productId: z
        .coerce
        .number('Product ID must be a number')
        .int('Product ID must be an integer')
        .positive('Product ID must be a positive number'),
});
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
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        "productId" INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        "createdAt" TEXT NOT NULL
      )
    `);
        await client.query(`
      CREATE TABLE IF NOT EXISTS replies (
        id SERIAL PRIMARY KEY,
        "ticketId" INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        "createdAt" TEXT NOT NULL
      )
    `);
    }
    finally {
        client.release();
    }
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
        const result = ticketCreateSchema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            const messages = Object.entries(errors)
                .map(([field, msgs]) => (msgs ? `${field}: ${msgs.join(', ')}` : ''))
                .filter(Boolean);
            res.status(400).json({
                message: 'Validation failed',
                errors: messages.length > 0 ? messages : result.error.message,
            });
            return;
        }
        const { email, name, subject, message, productId } = result.data;
        const status = 'open';
        const createdAt = new Date().toISOString();
        const { rows } = await pool.query(`INSERT INTO tickets (email, name, subject, message, "productId", status, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [email, name, subject, message, productId, status, createdAt]);
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
// GET /api/tickets/:id - get single ticket with replies
app.get('/api/tickets/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid ticket ID' });
            return;
        }
        const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
        if (ticketResult.rows.length === 0) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        const ticket = toTicket(ticketResult.rows[0]);
        const repliesResult = await pool.query('SELECT * FROM replies WHERE "ticketId" = $1 ORDER BY "createdAt" ASC', [id]);
        const replies = repliesResult.rows.map((r) => ({
            id: r.id,
            ticketId: r.ticketId,
            content: r.content,
            createdAt: r.createdAt,
        }));
        res.json({ ...ticket, replies });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// PATCH /api/tickets/:id - close ticket
app.patch('/api/tickets/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid ticket ID' });
            return;
        }
        const { status } = req.body;
        if (status !== 'closed') {
            res.status(400).json({ message: 'Only status "closed" is supported' });
            return;
        }
        const result = await pool.query('UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *', ['closed', id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        res.json(toTicket(result.rows[0]));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
const replyCreateSchema = z.object({
    content: z
        .string()
        .min(1, 'Reply cannot be empty')
        .max(10000, 'Reply is too long')
        .transform((s) => s.trim()),
});
// POST /api/tickets/:id/replies - add reply
app.post('/api/tickets/:id/replies', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid ticket ID' });
            return;
        }
        const parseResult = replyCreateSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                message: parseResult.error.flatten().fieldErrors.content?.[0] ?? 'Invalid reply',
            });
            return;
        }
        const ticketCheck = await pool.query('SELECT id FROM tickets WHERE id = $1', [id]);
        if (ticketCheck.rows.length === 0) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        const { content } = parseResult.data;
        const createdAt = new Date().toISOString();
        const { rows } = await pool.query('INSERT INTO replies ("ticketId", content, "createdAt") VALUES ($1, $2, $3) RETURNING *', [id, content, createdAt]);
        const reply = {
            id: rows[0].id,
            ticketId: rows[0].ticketId,
            content: rows[0].content,
            createdAt: rows[0].createdAt,
        };
        res.status(201).json(reply);
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
