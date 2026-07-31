import { STORAGE_KEYS } from "@/constants";

/**
 * Typed wrappers around localStorage for token, user, and permissions.
 */
export const StorageService = {
  // ── Token ──
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
  setToken(token: string) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },
  removeToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // ── User ──
  getUser<T>(): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser<T>(user: T) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  removeUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // ── Permissions ──
  getPermissions(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  setPermissions(perms: string[]) {
    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(perms));
  },
  removePermissions() {
    localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
  },

  // ── Clear All ──
  clearAuth() {
    this.removeToken();
    this.removeUser();
    this.removePermissions();
  },
};
