import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/router";
import { StorageService } from "@/services/storage.service";
import api from "@/lib/api";
import { isStaffRoute, isCustomerRoute, ROUTES } from "@/lib/routes";
import { hasPermission } from "@/lib/permissions";
import type { RoleName, PermissionName } from "@/constants";

// ── Types ──
export interface AuthUser {
  id: string;
  email: string;
  role: RoleName;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  staffProfile?: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser, permissions: string[]) => void;
  logout: () => void;
  can: (permission: PermissionName) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = StorageService.getToken();
      if (!token) return;
      const res = await api.get("/auth/me");
      const rawData = res.data?.data;
      const freshData = rawData?.user || rawData;
      if (freshData) {
        setUser((prev) => {
          const updated: AuthUser = {
            id: freshData.id || prev?.id,
            email: freshData.email || prev?.email,
            role: (freshData.role?.name || freshData.role || prev?.role) as RoleName,
            firstName: freshData.staffProfile?.firstName || freshData.customerProfile?.firstName || freshData.firstName || prev?.firstName,
            lastName: freshData.staffProfile?.lastName || freshData.customerProfile?.lastName || freshData.lastName || prev?.lastName,
            avatarUrl: freshData.avatarUrl ?? prev?.avatarUrl,
            staffProfile: freshData.staffProfile || prev?.staffProfile,
          };
          StorageService.setUser(updated);
          return updated;
        });
      }
    } catch (err: any) {
      console.warn("Session check or refresh info:", err);
      if (err?.response?.status === 401) {
        StorageService.clearAuth();
        setUser(null);
        setPermissions([]);
      }
    }
  }, []);

  // Hydrate from localStorage on mount & sync with server
  useEffect(() => {
    const savedUser = StorageService.getUser<AuthUser>();
    const savedPerms = StorageService.getPermissions();
    if (savedUser) {
      setUser(savedUser);
      setPermissions(savedPerms);
    }

    const token = StorageService.getToken();
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = useCallback((token: string, newUser: AuthUser, newPerms: string[]) => {
    StorageService.setToken(token);
    StorageService.setUser(newUser);
    StorageService.setPermissions(newPerms);
    setUser(newUser);
    setPermissions(newPerms);
  }, []);

  const logout = useCallback(() => {
    StorageService.clearAuth();
    setUser(null);
    setPermissions([]);
    router.push(ROUTES.LOGIN);
  }, [router]);

  const can = useCallback(
    (permission: PermissionName) => hasPermission(permissions, permission),
    [permissions],
  );

  // ── Route protection ──
  useEffect(() => {
    if (isLoading) return;

    const path = router.pathname;

    // Staff routes require staff/admin role
    if (isStaffRoute(path) && !user) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    // Customer routes require authentication
    if (isCustomerRoute(path) && !user) {
      router.replace(ROUTES.LOGIN);
      return;
    }
  }, [router.pathname, user, isLoading, router]);

  return (
    <AuthContext.Provider
      value={{ user, permissions, isLoading, isAuthenticated: !!user, login, logout, can, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
