import { z } from 'zod'

export const ticketCreateSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .email('Invalid email address'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name is too long')
    .transform((s) => s.trim()),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(500, 'Subject is too long')
    .transform((s) => s.trim()),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(10000, 'Message is too long')
    .transform((s) => s.trim()),
  productId: z
    .coerce
    .number('Product ID must be a number')
    .int('Product ID must be an integer')
    .positive('Product ID must be a positive number'),
})

export const replyCreateSchema = z.object({
  content: z
    .string()
    .min(1, 'Reply cannot be empty')
    .max(10000, 'Reply is too long')
    .transform((s) => s.trim()),
})
