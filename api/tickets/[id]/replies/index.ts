import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql, initDb, type ReplyRow } from '../../lib/db'
import { replyCreateSchema } from '../../lib/validation'

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const ticketId = getId(req)
  if (ticketId === null) {
    return res.status(400).json({ message: 'Invalid ticket ID' })
  }

  try {
    await ensureDb()

    const parseResult = replyCreateSchema.safeParse(req.body)
    if (!parseResult.success) {
      const msg = parseResult.error.flatten().fieldErrors.content?.[0] ?? 'Invalid reply'
      return res.status(400).json({ message: msg })
    }

    const ticketRows = await sql`SELECT id FROM tickets WHERE id = ${ticketId}`
    if (ticketRows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    const { content } = parseResult.data
    const createdAt = new Date().toISOString()

    const rows = (await sql`
      INSERT INTO replies ("ticketId", content, "createdAt") VALUES (${ticketId}, ${content}, ${createdAt})
      RETURNING *
    `) as ReplyRow[]

    const reply = {
      id: rows[0].id,
      ticketId: rows[0].ticketId,
      content: rows[0].content,
      createdAt: rows[0].createdAt,
    }
    return res.status(201).json(reply)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
