import { z } from 'zod';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../helpers/pagination.helper';

// ─── Primitive Validators ────────────────────────────────────

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z.string().email('Invalid email format').toLowerCase().trim();

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must be at most 128 characters');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +919876543210)')
  .optional();

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

// ─── Pagination Validators ───────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export const sortSchema = z.object({
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = z.object({
  search: z.string().trim().optional(),
});

// ─── Common Query Schemas ────────────────────────────────────

/** Standard list query: pagination + sort + search */
export const listQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema);

// ─── Parameter Schemas ───────────────────────────────────────

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const idOrSlugParamSchema = z.object({
  idOrSlug: z.string().min(1),
});
