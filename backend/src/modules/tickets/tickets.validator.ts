import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema, searchSchema } from '../../common/validators';

export const createTicketSchema = z.object({
  subject: z.string().min(2).max(200),
  category: z.string().optional().default('General'),
  description: z.string().optional(),
  message: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('LOW'),
  orderId: z.string().min(1, 'Order ID / Reference is required'),
});

export const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: uuidSchema.optional(),
});

export const addMessageSchema = z.object({
  message: z.string().min(2),
});

export const ticketQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedToId: uuidSchema.optional(),
  userId: uuidSchema.optional(), // Admin can query by user
});
