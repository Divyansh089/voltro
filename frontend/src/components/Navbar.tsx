import Link from "next/link";
import { useRouter } from "next/router";
import { Search, ShoppingBag, Heart, Zap, User, Bell, X, Check, CheckCheck } from "lucide-react";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/store/cart.store";
import { useWishlist } from "@/store/wishlist.store";
import { useCustomerProfile } from "@/modules/users/hooks/useCustomerProfile";
import { useMyNotifications } from "@/modules/notifications/hooks/useNotifications";

export function Navbar() {
  const router = useRouter();
  const onStaff = router.pathname.startsWith("/staff");
  const { user } = useAuth();
  const { data: profileData } = useCustomerProfile();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useMyNotifications({ limit: 4 });

  const displayName = user
    ? user.firstName
      ? `${user.firstName} ${user.lastName ?? ""}`.trim()
      : user.email.split("@")[0]
    : "";

  const currentAvatarUrl = profileData?.avatarUrl || user?.avatarUrl;

  const cart = useCart();
  const wish = useWishlist();
  const [q, setQ] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Track the page URL where customer started typing, to redirect back when cleared
  const originPathRef = useRef<string | null>(null);

  // Keep search state synchronized with URL query params
  useEffect(() => {
    if (router.query.q !== undefined) {
      setQ(router.query.q as string);
    }
  }, [router.query.q]);

  if (onStaff) return null;

  const handleSearchFocus = () => {
    if (!originPathRef.current && !router.pathname.startsWith("/categories")) {
      originPathRef.current = router.asPath;
    }
  };

  // Whenever customer types, redirect to /categories/all?q=... to find appropriate products
  const handleSearchChange = (value: string) => {
    if (!originPathRef.current && !router.pathname.startsWith("/categories")) {
      originPathRef.current = router.asPath;
    }

    setQ(value);
    const trimmed = value.trim();
    if (trimmed) {
      router.push({
        pathname: "/categories/all",
        query: { q: trimmed },
      });
    } else {
      // If customer backspaces to empty, redirect back to the page where they started typing!
      if (originPathRef.current) {
        const returnPath = originPathRef.current;
        originPathRef.current = null;
        router.push(returnPath);
      } else if (router.pathname.startsWith("/categories")) {
        router.push("/categories/all");
      }
    }
  };

  const handleClearSearch = () => {
    setQ("");
    if (originPathRef.current) {
      const returnPath = originPathRef.current;
      originPathRef.current = null;
      router.push(returnPath);
    } else if (router.pathname.startsWith("/categories")) {
      router.push("/categories/all");
    }
  };

  const getStripeColor = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "border-l-4 border-emerald-500 bg-emerald-50/30";
      case "CANCEL":
        return "border-l-4 border-rose-500 bg-rose-50/30";
      case "MAINTENANCE":
        return "border-l-4 border-amber-500 bg-amber-50/30";
      case "GENERAL":
      default:
        return "border-l-4 border-sky-500 bg-sky-50/30";
    }
  };

  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-[1400px] px-4 print:hidden space-y-2">
      <div className="glass flex items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2.5 pl-1 pr-2 shrink-0">
          <img src="/logo/voltra_logo.png" alt="Voltra Logo" className="h-8 w-auto object-contain shrink-0" />
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Voltra<span className="text-neon">.</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Search Bar (Expanded width to the left, right-aligned next to Notification icon) */}
          <form onSubmit={(e) => e.preventDefault()} className="relative hidden md:block w-72 lg:w-[380px] transition-all duration-300">
            <input
              type="text"
              value={q}
              onFocus={handleSearchFocus}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-full bg-white/60 pl-4 pr-16 text-xs text-ink placeholder:text-ink-muted outline-none ring-0 transition focus:bg-white/95 focus:ring-2 focus:ring-neon/60 shadow-sm"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {q.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="grid h-7 w-7 place-items-center text-ink-muted hover:text-ink transition"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              )}
              <button
                type="submit"
                aria-label="Search"
                className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white"
              >
                <Search size={13} strokeWidth={1.8} />
              </button>
            </div>
          </form>

          {/* Mobile Search Toggle Button (< 768px) */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-ink transition md:hidden"
            aria-label="Search products"
          >
            <Search size={16} />
          </button>

          {/* Notifications Icon (Left of Wishlist) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label="Notifications"
              className="relative grid h-10 w-10 place-items-center rounded-full bg-white/70 text-ink transition hover:bg-white"
            >
              <Bell size={16} strokeWidth={1.6} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-neon px-1 text-[9px] font-bold text-ink shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Real Notification Dropdown Drawer (Shows max 4 recent notifications) */}
            {isNotifOpen && (
              <div className="absolute right-0 top-12 z-50 w-84 md:w-96 p-4 rounded-2xl bg-white shadow-2xl border border-ink/10 animate-fadeIn space-y-3">
                <div className="flex items-center justify-between border-b border-ink/5 pb-2">
                  <div className="font-display text-sm font-bold text-ink flex items-center gap-2">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-extrabold text-neon-dark bg-neon/20 px-2 py-0.5 rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllAsRead()}
                      className="text-[10px] font-semibold text-ink-muted hover:text-ink flex items-center gap-1 transition"
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-ink-muted">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.slice(0, 4).map((n) => {
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
                            n.isRead ? "opacity-75" : "shadow-sm ring-1 ring-ink/10"
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
                            <p className="text-[11px] text-ink-soft leading-tight mt-1">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-ink/5 text-center">
                  <Link
                    href={user?.role === "CUSTOMER" ? "/customer/profile?tab=notifications" : "/staff/notifications"}
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-bold text-ink hover:text-neon-dark inline-flex items-center gap-1 transition"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <Link
            href="/customer/wishlist"
            aria-label="Wishlist"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/70 text-ink transition hover:bg-white"
          >
            <Heart size={16} strokeWidth={1.6} />
            {wish.count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {wish.count}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link
            href="/customer/cart"
            aria-label="Cart"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/70 text-ink transition hover:bg-white"
          >
            <ShoppingBag size={16} strokeWidth={1.6} />
            {cart.count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-neon px-1 text-[10px] font-bold text-ink">
                {cart.count}
              </span>
            )}
          </Link>

          {user ? (
            <Link
              href={user.role === "CUSTOMER" ? "/customer/profile" : "/staff/dashboard"}
              className="flex items-center gap-2 rounded-full bg-white/80 py-1 pl-3 pr-1 text-sm font-medium text-ink"
            >
              <span className="hidden sm:inline">{displayName}</span>
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt={displayName}
                  className="h-8 w-8 rounded-full object-cover shadow-sm border border-white/40"
                />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#FCD9B6] to-[#3B2A20] text-xs text-white">
                  {displayName[0]?.toUpperCase()}
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-full bg-ink py-2 pl-3 pr-4 text-sm font-medium text-white hover:bg-ink/90"
            >
              <User size={14} /> Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {isMobileSearchOpen && (
        <div className="glass p-2 animate-fadeIn md:hidden">
          <form onSubmit={(e) => e.preventDefault()} className="relative w-full">
            <input
              type="text"
              autoFocus
              value={q}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search catalog products..."
              className="h-10 w-full rounded-full bg-white/90 pl-4 pr-20 text-xs text-ink placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-neon"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {q.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="grid h-7 w-7 place-items-center text-ink-muted hover:text-ink transition"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              )}
              <button
                type="submit"
                aria-label="Submit search"
                className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white"
              >
                <Search size={13} strokeWidth={1.8} />
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
