import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema, searchSchema } from '../../common/validators';

export const createReviewSchema = z.object({
  productId: uuidSchema,
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});

export const reviewQuerySchema = paginationSchema.merge(sortSchema).extend({
  productId: uuidSchema.optional(),
  userId: uuidSchema.optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export const adminReviewQuerySchema = reviewQuerySchema.merge(searchSchema).extend({
  isApproved: z.enum(['true', 'false']).optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
});
