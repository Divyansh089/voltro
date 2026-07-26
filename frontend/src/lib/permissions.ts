import type { PermissionName } from "@/constants";

/**
 * Check if the user's permission set includes a specific permission.
 * Never hardcode roles — always check permissions.
 */
export function hasPermission(userPermissions: string[], permission: PermissionName): boolean {
  if (userPermissions.includes(permission)) return true;
  // Check wildcard (e.g., 'product:*' covers 'product:create')
  const [resource] = permission.split(":");
  return userPermissions.includes(`${resource}:*`);
}

// ── Convenience helpers ──
export const canManageProducts = (p: string[]) => hasPermission(p, "product:read");
export const canCreateProducts = (p: string[]) => hasPermission(p, "product:create");
export const canManageInventory = (p: string[]) => hasPermission(p, "inventory:read");
export const canManageOrders = (p: string[]) => hasPermission(p, "order:read");
export const canFulfillOrders = (p: string[]) => hasPermission(p, "order:update");
export const canManageUsers = (p: string[]) => hasPermission(p, "user:read");
export const canViewAnalytics = (p: string[]) => hasPermission(p, "analytics:read");
export const canManageCms = (p: string[]) => hasPermission(p, "cms:manage");
export const canReadTickets = (p: string[]) => hasPermission(p, "ticket:read");
export const canReplyTickets = (p: string[]) => hasPermission(p, "ticket:reply");
export const canReadCustomers = (p: string[]) => hasPermission(p, "customer:read");
