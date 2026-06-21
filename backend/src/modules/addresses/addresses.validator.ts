import { z } from 'zod';
import { paginationSchema, sortSchema, uuidSchema } from '../../common/validators';

export const addressSchema = z.object({
  label: z.string().min(1).default('Home'),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2).default('IN'),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = addressSchema.partial();

export const addressQuerySchema = paginationSchema.merge(sortSchema).extend({
  userId: uuidSchema.optional(), // Admin usage
});
