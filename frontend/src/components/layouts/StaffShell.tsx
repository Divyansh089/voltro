import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Headset,
  BarChart3,
  Layout,
  Users,
  LogOut,
  Bell,
  Zap,
  RotateCcw,
  Tag,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useCustomerProfile } from "@/modules/users/hooks/useCustomerProfile";
import { useMyNotifications } from "@/modules/notifications/hooks/useNotifications";
import type { PermissionName } from "@/constants";

type SidebarItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: PermissionName | null;
};

const ALL_SIDEBAR_ITEMS: SidebarItem[] = [
  { to: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: null },
  { to: "/staff/notifications", label: "Notifications", icon: Bell, permission: null },
  { to: "/staff/products", label: "Products", icon: Package, permission: "product:read" },
  { to: "/staff/inventory", label: "Inventory", icon: Warehouse, permission: "inventory:read" },
  { to: "/staff/orders", label: "Orders", icon: ShoppingCart, permission: "order:read" },
  { to: "/staff/refunds", label: "Refunds", icon: RotateCcw, permission: "order:read" },
  { to: "/staff/coupons", label: "Coupons", icon: Tag, permission: "cms:manage" },
  { to: "/staff/support", label: "Support", icon: Headset, permission: "ticket:read" },
  { to: "/staff/analytics", label: "Analytics", icon: BarChart3, permission: "analytics:read" },
  { to: "/staff/cms", label: "CMS", icon: Layout, permission: "cms:manage" },
  { to: "/staff/users", label: "Users", icon: Users, permission: "user:read" },
  { to: "/staff/settings", label: "Settings", icon: Settings, permission: null },
];

export function StaffShell({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const { user, permissions, logout } = useAuth();
  const { data: profileData } = useCustomerProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useMyNotifications();

  // Filter sidebar items based on user permissions and roles
  const visibleItems = ALL_SIDEBAR_ITEMS.filter((item) => {
    if (item.permission !== null && !permissions.includes(item.permission)) return false;
    // Product Managers only care about supply/inventory, hide analytics and users
    if (user?.role === "PRODUCT_MANAGER" && (item.label === "Analytics" || item.label === "Users")) {
      return false;
    }
    return true;
  });

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : (user?.email?.split("@")[0] ?? "Staff");

  const currentAvatarUrl = profileData?.avatarUrl || user?.avatarUrl;
  const roleBadge = user?.role?.replace("_", " ") ?? "Staff";

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1500px] gap-5 px-4 pt-4 pb-10">
        {/* Desktop Sidebar (lg:flex) */}
        <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col p-5 lg:flex">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo/voltra_logo.png" alt="Voltra Logo" className="h-8 w-auto object-contain shrink-0" />
            <div>
              <div className="font-display text-lg font-bold text-ink">
                Voltra<span className="text-neon">.</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-ink-muted">
                Staff Portal
              </div>
            </div>
          </Link>

          <nav className="mt-8 space-y-1">
            {visibleItems.map((it) => {
              const active = router.pathname === it.to;
              return (
                <Link
                  key={it.to}
                  href={it.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active ? "bg-ink text-white shadow-sm" : "text-ink-soft hover:bg-white/60 hover:text-ink"
                  }`}
                >
                  <it.icon size={16} strokeWidth={1.6} />
                  {it.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="mt-auto inline-flex items-center gap-2 px-3 py-2 text-xs text-ink-soft hover:text-ink transition font-medium"
          >
            <LogOut size={14} /> Sign out
          </button>
        </aside>

        {/* Mobile Slide-Over Drawer Navigation (< 1024px) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm animate-fadeIn"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Slide Drawer Content */}
            <aside className="relative z-10 w-72 max-w-[80vw] bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5">
                    <img src="/logo/voltra_logo.png" alt="Voltra Logo" className="h-8 w-auto object-contain shrink-0" />
                    <div>
                      <div className="font-display text-lg font-bold text-ink">
                        Voltra<span className="text-neon">.</span>
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-ink-muted">
                        Staff Portal
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-ink"
                  >
                    <X size={16} />
                  </button>
                </div>

                <nav className="mt-6 space-y-1">
                  {visibleItems.map((it) => {
                    const active = router.pathname === it.to;
                    return (
                      <Link
                        key={it.to}
                        href={it.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          active ? "bg-ink text-white shadow-sm" : "text-ink-soft hover:bg-slate-100 hover:text-ink"
                        }`}
                      >
                        <it.icon size={18} strokeWidth={1.6} />
                        {it.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-ink/10">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Topbar */}
          <header className="glass relative z-50 flex items-center justify-between lg:justify-end gap-3 px-5 py-3">
            {/* Mobile Hamburger Toggle (< 1024px) */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/80 text-ink hover:bg-white transition shadow-sm border border-ink/5"
                aria-label="Toggle Staff Navigation"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="font-display text-base font-bold text-ink truncate">Voltra Staff</div>
            </div>

            <div className="flex items-center gap-3">
              {/* Interactive Notification Bell Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative grid h-10 w-10 place-items-center rounded-full bg-white/70 text-ink-soft hover:bg-white hover:text-ink transition border border-ink/5 shadow-sm"
                  title="Staff Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-neon px-1 text-[9px] font-extrabold text-ink shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isNotifOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[90]"
                      onClick={() => setIsNotifOpen(false)}
                    />
                    <div className="absolute right-0 top-12 z-[100] w-80 sm:w-96 rounded-2xl border border-ink/10 bg-white p-4 shadow-2xl space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-ink/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Bell size={16} className="text-neon-dark" />
                          <h4 className="font-display text-sm font-bold text-ink">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="rounded-full bg-neon/20 px-2 py-0.5 text-[10px] font-extrabold text-neon-dark">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => markAllAsRead()}
                            className="text-[11px] font-bold text-ink-soft hover:text-neon-dark transition"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-ink-muted font-medium">
                            No notifications at the moment.
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => {
                            const getStripeBg = (type: string) => {
                              switch (type) {
                                case "SUCCESS": return "bg-emerald-500";
                                case "CANCEL": return "bg-rose-500";
                                case "MAINTENANCE": return "bg-amber-500";
                                case "GENERAL": default: return "bg-sky-500";
                              }
                            };
                            return (
                              <div
                                key={n.id}
                                onClick={() => !n.isRead && markAsRead(n.id)}
                                className={`flex items-stretch overflow-hidden rounded-xl border border-ink/10 bg-white transition cursor-pointer hover:bg-slate-50 ${
                                  n.isRead ? "opacity-70" : "shadow-sm ring-1 ring-ink/10 font-medium"
                                }`}
                              >
                                <div className={`w-1.5 shrink-0 ${getStripeBg(n.type)}`} />
                                <div className="flex-1 p-2.5">
                                  <div className="flex items-center justify-between text-xs font-bold text-ink">
                                    <span className="truncate pr-2">{n.title}</span>
                                    <span className="text-[10px] text-ink-muted shrink-0">
                                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-ink-soft leading-tight mt-1 line-clamp-2">
                                    {n.message}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="border-t border-ink/10 pt-2 text-center">
                        <Link
                          href="/staff/notifications"
                          onClick={() => setIsNotifOpen(false)}
                          className="block text-xs font-bold text-ink hover:text-neon-dark transition py-1"
                        >
                          View all notifications →
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 rounded-full bg-white/70 py-1 pl-1 pr-4">
                {currentAvatarUrl ? (
                  <img
                    src={currentAvatarUrl}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover shadow-sm border border-white/40"
                  />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#FCD9B6] to-[#3B2A20] text-xs text-white font-bold">
                    {displayName[0]?.toUpperCase() ?? "S"}
                  </span>
                )}
                <div className="text-xs">
                  <div className="font-semibold text-ink">{displayName}</div>
                  <div className="text-ink-muted capitalize">{roleBadge.toLowerCase()}</div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
