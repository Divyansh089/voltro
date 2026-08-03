import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/store/cart.store";
import { useWishlist } from "@/store/wishlist.store";
import { LogOut, Package, Heart, MapPin, Settings, Mail, MessageSquare } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export default function Profile() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const router = useRouter();

  if (!user) return null;

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : user.email.split("@")[0];

  return (
    <>
      <Head>
        <title>Profile — Voltra</title>
      </Head>
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Identity card */}
          <aside className="glass p-7 lg:col-span-1">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#FCD9B6] to-[#3B2A20] text-xl font-bold text-white">
                {displayName[0]?.toUpperCase()}
              </span>
              <div>
                <div className="font-display text-xl font-bold text-ink">{displayName}</div>
                <div className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
                  <Mail size={12} /> {user.email}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              {[
                { k: "Orders", v: 0 },
                { k: "Wishlist", v: wishCount },
                { k: "In Cart", v: count },
              ].map((s) => (
                <div key={s.k} className="glass-soft p-3">
                  <div className="font-display text-lg font-bold text-ink">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted">{s.k}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                logout();
                router.push(ROUTES.HOME);
              }}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-sm font-semibold text-white hover:bg-ink/90"
            >
              <LogOut size={14} /> Sign out
            </button>
          </aside>

          <section className="space-y-6 lg:col-span-2">
            {/* Quick links */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {[
                { to: ROUTES.CUSTOMER_ORDERS, icon: Package, label: "My Orders" },
                { to: ROUTES.CUSTOMER_WISHLIST, icon: Heart, label: "Wishlist" },
                { to: ROUTES.CUSTOMER_SUPPORT, icon: MessageSquare, label: "Support Tickets" },
                { to: ROUTES.CUSTOMER_PROFILE, icon: MapPin, label: "Addresses" },
                { to: ROUTES.CUSTOMER_PROFILE, icon: Settings, label: "Settings" },
              ].map((it) => (
                <Link
                  key={it.label}
                  href={it.to}
                  className="glass-soft flex flex-col items-start gap-3 p-4 transition hover:-translate-y-0.5"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-neon text-ink">
                    <it.icon size={16} />
                  </span>
                  <div className="text-sm font-semibold text-ink">{it.label}</div>
                </Link>
              ))}
            </div>

            {/* Profile details */}
            <div className="glass p-7">
              <h3 className="font-display text-lg font-semibold text-ink">Account details</h3>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ["First name", user.firstName || displayName],
                  ["Last name", user.lastName || ""],
                  ["Email", user.email],
                  ["Phone", "+1 (415) 555 0123"],
                  ["Member since", "May 2026"],
                ].map(([k, v]) => (
                  <div key={k} className="glass-soft p-4">
                    <div className="text-[11px] uppercase tracking-wider text-ink-muted">{k}</div>
                    <div className="mt-1 text-sm font-semibold text-ink">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
