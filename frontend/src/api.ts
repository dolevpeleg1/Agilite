import type { Product, Reply, Ticket, TicketCreatePayload, TicketWithReplies } from './types'

const PRODUCTS_API_URL = 'https://api.escuelajs.co/api/v1/products'
const TICKETS_API_URL = '/api/tickets'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Something went wrong. Please try again.'

    try {
      const data = (await response.json()) as { message?: string; error?: string }
      message = data.message ?? data.error ?? message
    } catch {
      // ignore JSON parse errors and fall back to default message
    }

    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(PRODUCTS_API_URL)
  return handleResponse<Product[]>(res)
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`${PRODUCTS_API_URL}/${id}`)
  return handleResponse<Product>(res)
}

export async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch(TICKETS_API_URL)
  return handleResponse<Ticket[]>(res)
}

export async function fetchTicket(id: number): Promise<TicketWithReplies> {
  const res = await fetch(`${TICKETS_API_URL}/${id}`)
  return handleResponse<TicketWithReplies>(res)
}

export async function closeTicket(id: number): Promise<Ticket> {
  const res = await fetch(`${TICKETS_API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'closed' }),
  })
  return handleResponse<Ticket>(res)
}

export async function addReply(ticketId: number, content: string): Promise<Reply> {
  const res = await fetch(`${TICKETS_API_URL}/${ticketId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  return handleResponse<Reply>(res)
}

export async function createTicket(payload: TicketCreatePayload): Promise<Ticket> {
  const res = await fetch(TICKETS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse<Ticket>(res)
}

