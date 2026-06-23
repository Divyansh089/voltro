import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema } from '../../common/validators';

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
});

export const adjustInventorySchema = z.object({
  adjustment: z.number().int(), // Can be positive or negative
  reason: z.string().min(3),
});

export const inventoryQuerySchema = paginationSchema.merge(sortSchema).extend({
  variantId: uuidSchema.optional(),
  productId: uuidSchema.optional(),
  lowStockOnly: z.enum(['true', 'false']).optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
});
