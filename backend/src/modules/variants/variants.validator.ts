import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema, searchSchema } from '../../common/validators';

export const createVariantSchema = z.object({
  productId: uuidSchema,
  sku: z.string().min(3, 'SKU must be at least 3 characters').toUpperCase(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  color: z.string().optional(),
  storage: z.string().optional(),
  size: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive').optional(),
  isActive: z.boolean().default(true),
  initialStock: z.number().int().min(0).default(0), // Creates inventory automatically
});

export const updateVariantSchema = createVariantSchema.partial().omit({ productId: true, initialStock: true });

export const variantListQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  productId: uuidSchema.optional(),
  isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
});
