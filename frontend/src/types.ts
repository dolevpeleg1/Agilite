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

export interface Reply {
  id: number
  ticketId: number
  content: string
  createdAt: string
}

export interface Ticket extends TicketCreatePayload {
  id: number
  status: TicketStatus
  createdAt: string
  productName?: string
}

export interface TicketWithReplies extends Ticket {
  replies: Reply[]
}

