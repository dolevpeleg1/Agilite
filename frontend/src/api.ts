import type { Product, Ticket, TicketCreatePayload } from './types'

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

