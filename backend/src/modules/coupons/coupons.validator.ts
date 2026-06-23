import { z } from 'zod';
import { paginationSchema, sortSchema, searchSchema } from '../../common/validators';

export const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxDiscountAmount: z.coerce.number().positive().optional(),
  usageLimit: z.coerce.number().int().min(1).optional(),
  perUserLimit: z.coerce.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  orderAmount: z.coerce.number().min(0),
});

export const couponQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
});
