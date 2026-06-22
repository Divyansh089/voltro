import { z } from 'zod';
import { uuidSchema } from '../../common/validators';

export const cartItemSchema = z.object({
  variantId: uuidSchema,
  quantity: z.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});
