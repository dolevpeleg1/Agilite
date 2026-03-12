import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql, initDb, toTicket, type TicketRow } from '../lib/db'
import { ticketCreateSchema } from '../lib/validation'

async function ensureDb() {
  try {
    await initDb()
  } catch (e) {
    // Tables may already exist
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await ensureDb()

    if (req.method === 'GET') {
      const rows = (await sql`SELECT * FROM tickets ORDER BY "createdAt" DESC`) as TicketRow[]
      return res.status(200).json(rows.map(toTicket))
    }

    if (req.method === 'POST') {
      const result = ticketCreateSchema.safeParse(req.body)
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        const messages = Object.entries(errors)
          .map(([field, msgs]) => (msgs ? `${field}: ${msgs.join(', ')}` : ''))
          .filter(Boolean)
        return res.status(400).json({
          message: 'Validation failed',
          errors: messages.length > 0 ? messages : result.error.message,
        })
      }

      const { email, name, subject, message, productId } = result.data
      const status = 'open'
      const createdAt = new Date().toISOString()

      const rows = (await sql`
        INSERT INTO tickets (email, name, subject, message, "productId", status, "createdAt")
        VALUES (${email}, ${name}, ${subject}, ${message}, ${productId}, ${status}, ${createdAt})
        RETURNING *
      `) as TicketRow[]

      return res.status(201).json(toTicket(rows[0]))
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
