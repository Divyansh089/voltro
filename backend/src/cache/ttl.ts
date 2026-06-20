/**
 * TTL (Time-to-Live) Constants
 *
 * All values in seconds.
 * Grouped by data category for easy tuning.
 */
export const TTL = {
  // ── Sessions & Auth ────────────────────────────────────
  SESSION: 7 * 24 * 60 * 60,        // 7 days
  REFRESH_TOKEN: 7 * 24 * 60 * 60,  // 7 days
  EMAIL_VERIFY: 24 * 60 * 60,       // 24 hours
  PASSWORD_RESET: 15 * 60,           // 15 minutes
  LOGIN_ATTEMPTS: 15 * 60,           // 15 minutes

  // ── RBAC ───────────────────────────────────────────────
  ROLE_PERMISSIONS: 60 * 60,         // 1 hour

  // ── Users ──────────────────────────────────────────────
  USER_PROFILE: 30 * 60,            // 30 minutes

  // ── Products ───────────────────────────────────────────
  PRODUCT_DETAIL: 15 * 60,          // 15 minutes
  PRODUCTS_LIST: 5 * 60,            // 5 minutes
  PRODUCTS_FEATURED: 30 * 60,       // 30 minutes

  // ── Categories ─────────────────────────────────────────
  CATEGORIES_TREE: 60 * 60,         // 1 hour

  // ── Inventory ──────────────────────────────────────────
  INVENTORY: 30,                     // 30 seconds (high-frequency changes)

  // ── Cart ────────────────────────────────────────────────
  CART: 5 * 60,                      // 5 minutes

  // ── Notifications ──────────────────────────────────────
  NOTIFICATIONS_UNREAD: 5 * 60,     // 5 minutes

  // ── CMS ────────────────────────────────────────────────
  CMS_CONTENT: 10 * 60,             // 10 minutes

  // ── Dashboard ──────────────────────────────────────────
  DASHBOARD: 5 * 60,                // 5 minutes

  // ── Support ────────────────────────────────────────────
  SUPPORT_COUNT: 60,                 // 1 minute
} as const;
