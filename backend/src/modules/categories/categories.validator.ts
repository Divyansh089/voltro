import { z } from 'zod';
import { uuidSchema, slugSchema, paginationSchema, sortSchema, searchSchema } from '../../common/validators';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  parentId: uuidSchema.optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryListQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  parentId: uuidSchema.optional(), // Filter by specific parent
  rootOnly: z.enum(['true', 'false']).optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined), // Only get root categories
});
