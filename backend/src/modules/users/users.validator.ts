import { z } from 'zod';
import { emailSchema, phoneSchema, uuidSchema, paginationSchema, sortSchema, searchSchema } from '../../common/validators';

export const createUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roleId: uuidSchema,
  isActive: z.boolean().default(true),
  isEmailVerified: z.boolean().default(false),
  avatarUrl: z.string().url().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const createStaffSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
  role: z.enum(['ADMIN', 'PRODUCT_MANAGER', 'CUSTOMER_SUPPORT']),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const updateMeSchema = z.object({
  email: emailSchema.optional(),
  phone: z.string().or(z.literal('')).optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(1, 'New password must not be empty').optional(),
});

export const userListQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  role: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
});
