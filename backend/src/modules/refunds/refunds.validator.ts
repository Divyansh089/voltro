import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema, searchSchema } from '../../common/validators';

export const createRefundRequestSchema = z.object({
  orderId: uuidSchema,
  reason: z.string().min(5),
  description: z.string().optional(),
  amount: z.coerce.number().positive(),
});

export const updateRefundRequestSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED']),
  adminNotes: z.string().optional(),
});

export const refundQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  status: z.string().optional(),
  userId: uuidSchema.optional(),
  orderId: uuidSchema.optional(),
});
