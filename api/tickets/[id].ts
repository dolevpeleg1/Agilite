import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql, initDb, toTicket, type TicketRow, type ReplyRow } from '../lib/db'

function getId(req: VercelRequest): number | null {
  let id = req.query?.id
  if (typeof id !== 'string' && req.url) {
    const match = /\/api\/tickets\/(\d+)/.exec(req.url)
    id = match?.[1]
  }
  if (typeof id !== 'string') return null
  const n = parseInt(id, 10)
  return isNaN(n) ? null : n
}

async function ensureDb() {
  try {
    await initDb()
  } catch {
    // Tables may already exist
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const id = getId(req)
  if (id === null) {
    return res.status(400).json({ message: 'Invalid ticket ID' })
  }

  try {
    await ensureDb()

    if (req.method === 'GET') {
      const ticketRows = (await sql`SELECT * FROM tickets WHERE id = ${id}`) as TicketRow[]
      if (ticketRows.length === 0) {
        return res.status(404).json({ message: 'Ticket not found' })
      }
      const ticket = toTicket(ticketRows[0])
      const replyRows = (await sql`
        SELECT * FROM replies WHERE "ticketId" = ${id} ORDER BY "createdAt" ASC
      `) as ReplyRow[]
      const replies = replyRows.map((r) => ({
        id: r.id,
        ticketId: r.ticketId,
        content: r.content,
        createdAt: r.createdAt,
      }))
      return res.status(200).json({ ...ticket, replies })
    }

    if (req.method === 'PATCH') {
      const body = req.body as { status?: string }
      if (body?.status !== 'closed') {
        return res.status(400).json({ message: 'Only status "closed" is supported' })
      }
      const rows = (await sql`
        UPDATE tickets SET status = 'closed' WHERE id = ${id} RETURNING *
      `) as TicketRow[]
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Ticket not found' })
      }
      return res.status(200).json(toTicket(rows[0]))
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
