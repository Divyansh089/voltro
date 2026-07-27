import { useAuth } from "@/providers/AuthProvider";
import type { PermissionName } from "@/constants";

/**
 * Hook to check if the current user has a specific permission.
 * Usage: const canEdit = usePermission('product:update');
 */
export function usePermission(permission: PermissionName): boolean {
  const { can } = useAuth();
  return can(permission);
}
