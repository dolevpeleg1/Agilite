import express, { Request, Response } from 'express'
import cors from 'cors'
import pg from 'pg'

interface TicketCreateBody {
  email?: string
  name?: string
  subject?: string
  message?: string
  productId?: number
}

interface TicketRow {
  id: number
  email: string
  name: string
  subject: string
  message: string
  productId: number
  status: string
  createdAt: string
}

interface Ticket {
  id: number
  email: string
  name: string
  subject: string
  message: string
  productId: number
  status: string
  createdAt: string
}

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

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
})

async function initDb(): Promise<void> {
  const client = await pool.connect()
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
    `)
  } finally {
    client.release()
  }
}

function toTicket(row: TicketRow): Ticket {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    subject: row.subject,
    message: row.message,
    productId: row.productId,
    status: row.status,
    createdAt: row.createdAt,
  }
}

// POST /api/tickets - create ticket
app.post('/api/tickets', async (req: Request<object, object, TicketCreateBody>, res: Response): Promise<void> => {
  try {
    const { email, name, subject, message, productId } = req.body

    if (!email || !name || !subject || !message || productId == null) {
      res.status(400).json({
        message: 'Missing required fields: email, name, subject, message, productId',
      })
      return
    }

    const status = 'open'
    const createdAt = new Date().toISOString()

    const { rows } = await pool.query<TicketRow>(
      `INSERT INTO tickets (email, name, subject, message, "productId", status, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [email, name, subject, message, productId, status, createdAt]
    )
    res.status(201).json(toTicket(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// GET /api/tickets - list all tickets (newest first)
app.get('/api/tickets', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query<TicketRow>(
      'SELECT * FROM tickets ORDER BY "createdAt" DESC'
    )
    res.json(rows.map(toTicket))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`)
    })
  })
  .catch((err: unknown) => {
    console.error('Database init failed:', err)
    process.exit(1)
  })
