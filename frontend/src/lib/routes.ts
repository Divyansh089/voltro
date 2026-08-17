import { ROLES } from "@/constants";
import type { RoleName } from "@/constants";

/** Route constants */
export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  SEARCH: "/search",
  CATEGORIES: "/categories/all",

  // Customer
  CUSTOMER_PROFILE: "/customer/profile",
  CUSTOMER_ORDERS: "/customer/profile?tab=orders",
  CUSTOMER_CART: "/customer/cart",
  CUSTOMER_CHECKOUT: "/customer/checkout",
  CUSTOMER_WISHLIST: "/customer/wishlist",
  CUSTOMER_SUPPORT: "/customer/profile?tab=support",

  // Staff
  STAFF_DASHBOARD: "/staff/dashboard",
  STAFF_PRODUCTS: "/staff/products",
  STAFF_INVENTORY: "/staff/inventory",
  STAFF_ORDERS: "/staff/orders",
  STAFF_COUPONS: "/staff/coupons",
  STAFF_SUPPORT: "/staff/support",
  STAFF_ANALYTICS: "/staff/analytics",
  STAFF_CMS: "/staff/cms",
  STAFF_USERS: "/staff/users",
} as const;

/**
 * After login, redirect the user to the appropriate landing page
 * based on their role.
 */
export function getDefaultRouteForRole(role: RoleName): string {
  switch (role) {
    case ROLES.ADMIN:
    case ROLES.PRODUCT_MANAGER:
    case ROLES.CUSTOMER_SUPPORT:
      return ROUTES.STAFF_DASHBOARD;
    case ROLES.CUSTOMER:
    default:
      return ROUTES.HOME;
  }
}

/**
 * Check if a given pathname belongs to the staff area.
 */
export function isStaffRoute(pathname: string): boolean {
  return pathname.startsWith("/staff");
}

/**
 * Check if a given pathname belongs to the customer area.
 */
export function isCustomerRoute(pathname: string): boolean {
  return pathname.startsWith("/customer");
}
