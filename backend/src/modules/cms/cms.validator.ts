import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema } from '../../common/validators';

// ── Homepage Banners ─────────────────────────────────────

export const createBannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  imageUrl: z.string().url(),
  linkUrl: z.string().url().optional(),
  productId: uuidSchema.optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export const updateBannerSchema = createBannerSchema.partial();

// ── Featured Products ────────────────────────────────────

export const createFeaturedProductSchema = z.object({
  productId: uuidSchema,
  sortOrder: z.coerce.number().int().default(0),
  label: z.string().optional(),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export const updateFeaturedProductSchema = createFeaturedProductSchema.partial();

// ── Promotional Campaigns ────────────────────────────────

export const createCampaignSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  bannerImageUrl: z.string().url().optional(),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  couponId: uuidSchema.optional(),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();
