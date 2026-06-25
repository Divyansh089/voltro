import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema } from '../../common/validators';

export const wishlistItemSchema = z.object({
  productId: uuidSchema,
});

export const wishlistQuerySchema = paginationSchema.merge(sortSchema);
