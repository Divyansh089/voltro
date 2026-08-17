import { z } from 'zod';

export const createVariantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1).max(100),
  optionValueIds: z.array(z.string().uuid()).min(1).optional(),
  price: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  initialStock: z.number().int().min(0).optional(),
});

export const updateVariantSchema = z.object({
  sku: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export const listVariantsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  productId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'price', 'sku', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
