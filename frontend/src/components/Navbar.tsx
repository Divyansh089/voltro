import Link from "next/link";
import { useRouter } from "next/router";
import { Search, ShoppingBag, Heart, Zap, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth, useCart, useWishlist } from "@/lib/store";

export function Navbar() {
  const router = useRouter();
  const onAdmin = router.pathname.startsWith("/admin") || router.pathname.startsWith("/dealer");
  const { user } = useAuth();
  const cart = useCart();
  const wish = useWishlist();
  const [q, setQ] = useState("");

  if (onAdmin) return null;

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: "/search",
      query: { q },
    });
  };

  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-[1400px] px-4">
      <div className="glass flex items-center gap-3 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2 pl-2 pr-4">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-white">
            <Zap size={16} strokeWidth={2} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Voltra<span className="text-neon">.</span>
          </span>
        </Link>

        <form onSubmit={onSearch} className="relative ml-2 hidden flex-1 md:block">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="h-11 w-full rounded-full bg-white/60 pl-5 pr-12 text-sm text-ink placeholder:text-ink-muted outline-none ring-0 transition focus:bg-white/90 focus:ring-2 focus:ring-neon/60"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-ink text-white"
          >
            <Search size={14} strokeWidth={1.8} />
          </button>
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {[
            { href: "/categories", label: "Categories" },
            { href: "/admin/dashboard", label: "Admin" },
            { href: "/dealer", label: "Dealer" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-sm text-ink-soft transition hover:bg-white/60 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-2 flex items-center gap-2">
          <Link
            href="/cart"
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
          <Link
            href="/wishlist"
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

          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full bg-white/80 py-1 pl-3 pr-1 text-sm font-medium text-ink"
            >
              <span className="hidden sm:inline">{user.name}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#FCD9B6] to-[#3B2A20] text-xs text-white">
                {user.name[0]?.toUpperCase()}
              </span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-ink py-2 pl-3 pr-4 text-sm font-medium text-white hover:bg-ink/90"
            >
              <User size={14} /> Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
