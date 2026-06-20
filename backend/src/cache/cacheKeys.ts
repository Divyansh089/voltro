/**
 * Centralized Cache Key Templates
 *
 * All Redis cache keys are defined here to prevent key collisions
 * and make cache invalidation discoverable.
 *
 * Format: voltra:{resource}:{identifier}:{qualifier}
 * (The 'voltra:' prefix is added automatically by the Redis client)
 */
export const CacheKeys = {
  // ── Sessions & Auth ────────────────────────────────────
  session: (sessionId: string) => `session:${sessionId}`,
  refreshToken: (hashedToken: string) => `refresh:${hashedToken}`,
  emailVerify: (token: string) => `email_verify:${token}`,
  passwordReset: (token: string) => `password_reset:${token}`,
  loginAttempts: (email: string) => `login_attempts:${email}`,

  // ── RBAC ───────────────────────────────────────────────
  rolePermissions: (roleId: string) => `role:${roleId}:permissions`,

  // ── Users ──────────────────────────────────────────────
  userProfile: (userId: string) => `user:${userId}:profile`,

  // ── Products ───────────────────────────────────────────
  productDetail: (productId: string) => `product:${productId}:detail`,
  productsList: (filterHash: string) => `products:list:${filterHash}`,
  productsFeatured: () => 'products:featured',

  // ── Categories ─────────────────────────────────────────
  categoriesTree: () => 'categories:tree',

  // ── Inventory ──────────────────────────────────────────
  inventory: (variantId: string) => `inventory:${variantId}`,

  // ── Cart ────────────────────────────────────────────────
  cart: (userId: string) => `cart:${userId}`,

  // ── Notifications ──────────────────────────────────────
  notificationsUnreadCount: (userId: string) => `notifications:${userId}:unread_count`,

  // ── CMS ────────────────────────────────────────────────
  cmsBannersActive: () => 'cms:banners:active',
  cmsFeatured: () => 'cms:featured',
  cmsCampaignsActive: () => 'cms:campaigns:active',

  // ── Dashboard ──────────────────────────────────────────
  dashboardSummary: (dateRange: string) => `dashboard:summary:${dateRange}`,

  // ── Rate Limiting ──────────────────────────────────────
  rateLimit: (ip: string, endpoint: string) => `rate_limit:${ip}:${endpoint}`,

  // ── Support ────────────────────────────────────────────
  supportUnassignedCount: () => 'support:unassigned_count',
} as const;
