import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function initDb(): Promise<void> {
  await sql`
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
  `
  await sql`
    CREATE TABLE IF NOT EXISTS replies (
      id SERIAL PRIMARY KEY,
      "ticketId" INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      "createdAt" TEXT NOT NULL
    )
  `
}

export interface TicketRow {
  id: number
  email: string
  name: string
  subject: string
  message: string
  productId: number
  status: string
  createdAt: string
}

export interface ReplyRow {
  id: number
  ticketId: number
  content: string
  createdAt: string
}

export function toTicket(row: TicketRow) {
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

export { sql }
