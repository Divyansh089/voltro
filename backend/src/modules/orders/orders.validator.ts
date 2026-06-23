import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema, searchSchema } from '../../common/validators';

export const createOrderSchema = z.object({
  shippingAddressId: uuidSchema,
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  cancellationReason: z.string().optional(),
});

export const orderQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  userId: uuidSchema.optional(),
  status: z.string().optional(),
});
