import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema, searchSchema } from '../../common/validators';

export const createOrderSchema = z.object({
  shippingAddressId: z.string().optional(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      variantId: z.string().optional(),
      productName: z.string().optional(),
      variantName: z.string().optional(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().optional(),
    })
  ).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'IN_TRANSIT', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  cancellationReason: z.string().optional(),
});

export const orderQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  userId: uuidSchema.optional(),
  status: z.string().optional(),
});
