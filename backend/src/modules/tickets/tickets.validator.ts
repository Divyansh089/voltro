import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema, searchSchema } from '../../common/validators';

export const createTicketSchema = z.object({
  subject: z.string().min(5).max(150),
  description: z.string().min(10),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('LOW'),
  orderId: uuidSchema.optional(),
});

export const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
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
