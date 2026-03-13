import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql, initDb, type ReplyRow } from './lib/db'
import { replyCreateSchema } from './lib/validation'

/**
 * Handles POST /api/tickets/:id/replies via rewrite from vercel.json.
 * Ticket ID comes from req.query.id (set by the rewrite).
 */
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

  const rawId = req.query?.id ?? (req as { id?: string }).id
  const ticketId =
    typeof rawId === 'string' ? parseInt(rawId, 10) : NaN
  if (isNaN(ticketId) || ticketId < 1) {
    return res.status(400).json({ message: 'Invalid ticket ID' })
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set')
    return res.status(503).json({
      message:
        'Database not configured. Add DATABASE_URL in Vercel project settings.',
    })
  }

  try {
    await initDb()
  } catch {
    // Tables may already exist
  }

  try {
    const parseResult = replyCreateSchema.safeParse(req.body)
    if (!parseResult.success) {
      const msg =
        parseResult.error.flatten().fieldErrors.content?.[0] ?? 'Invalid reply'
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
    console.error('Replies API error:', err)
    const message =
      err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ message })
  }
}
