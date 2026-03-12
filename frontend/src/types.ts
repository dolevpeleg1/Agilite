export type TicketStatus = 'open' | 'closed'

export interface Product {
  id: number
  title: string
  price: number
  category?: {
    id: number
    name: string
  }
  images: string[]
}

export interface TicketCreatePayload {
  email: string
  name: string
  subject: string
  message: string
  productId: number
}

export interface Ticket extends TicketCreatePayload {
  id: string
  status: TicketStatus
  createdAt: string
}

