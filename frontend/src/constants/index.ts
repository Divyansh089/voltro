// ── API ──
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Roles ──
export const ROLES = {
  ADMIN: "ADMIN",
  PRODUCT_MANAGER: "PRODUCT_MANAGER",
  CUSTOMER_SUPPORT: "CUSTOMER_SUPPORT",
  CUSTOMER: "CUSTOMER",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

// ── Permissions ──
export const PERMISSIONS = {
  // Product
  PRODUCT_CREATE: "product:create",
  PRODUCT_READ: "product:read",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",
  // Inventory
  INVENTORY_READ: "inventory:read",
  INVENTORY_UPDATE: "inventory:update",
  // Order
  ORDER_READ: "order:read",
  ORDER_UPDATE: "order:update",
  // User
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  // Customer
  CUSTOMER_READ: "customer:read",
  // Ticket
  TICKET_READ: "ticket:read",
  TICKET_REPLY: "ticket:reply",
  // CMS
  CMS_MANAGE: "cms:manage",
  // Analytics
  ANALYTICS_READ: "analytics:read",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ── Storage Keys ──
export const STORAGE_KEYS = {
  TOKEN: "voltra.token",
  USER: "voltra.user",
  PERMISSIONS: "voltra.permissions",
  CART: "voltra.cart",
  WISHLIST: "voltra.wishlist",
} as const;
