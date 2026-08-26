import Link from "next/link";
import { useRouter } from "next/router";
import {
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Lock,
  Mail,
  Globe,
  ArrowUpRight,
  Headset,
  CheckCircle2,
} from "lucide-react";
import { useState, type FormEvent } from "react";

export function Footer() {
  const router = useRouter();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (
    router.pathname.startsWith("/admin") ||
    router.pathname.startsWith("/dealer") ||
    router.pathname.startsWith("/staff")
  ) {
    return null;
  }

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setNewsletterEmail("");
    }, 4000);
  };

  return (
    <footer className="mx-auto mt-10 w-full max-w-[1400px] px-4 pb-10 print:hidden space-y-4">
      {/* ── Main Multi-Column Footer Body ── */}
      <div className="glass p-8 md:p-12 space-y-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo/voltra_logo.png" alt="Voltra Logo" className="h-9 w-auto object-contain shrink-0" />
              <span className="font-display text-2xl font-bold tracking-tight text-ink">
                Voltra<span className="text-neon">.</span>
              </span>
            </Link>
            <p className="text-xs text-ink-soft max-w-sm leading-relaxed">
              Voltra manufactures next-generation consumer electronics, high-performance computing, spatial audio, and neural devices delivered directly to your doorstep.
            </p>

            {/* Newsletter Box */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Subscribe for Flagship Drops
              </h5>
              {isSubscribed ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={16} /> Thank you! You’re subscribed to Voltra Insider.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-10 w-full rounded-xl border border-ink/10 bg-white/70 pl-9 pr-3 text-xs text-ink placeholder:text-ink-muted outline-none focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/30"
                    />
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  </div>
                  <button
                    type="submit"
                    className="btn-neon px-4 h-10 text-xs font-extrabold shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 1: Shop & Ecosystem */}
          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-ink mb-4">
              Shop & Ecosystem
            </h5>
            <ul className="space-y-2.5 text-xs text-ink-soft">
              <li>
                <Link href="/search?q=Laptop" className="hover:text-ink transition">
                  Quantum Laptops
                </Link>
              </li>
              <li>
                <Link href="/search?q=Phone" className="hover:text-ink transition">
                  Neural Smartphones
                </Link>
              </li>
              <li>
                <Link href="/search?q=Audio" className="hover:text-ink transition">
                  Spatial Headphones
                </Link>
              </li>
              <li>
                <Link href="/search?q=Watch" className="hover:text-ink transition">
                  Smart Wearables
                </Link>
              </li>
              <li>
                <Link href="/customer/checkout" className="hover:text-ink transition">
                  Voltra Platinum Card
                </Link>
              </li>
              <li>
                <Link href="/categories/electronics" className="hover:text-ink transition">
                  All Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Account */}
          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-ink mb-4">
              Account & Support
            </h5>
            <ul className="space-y-2.5 text-xs text-ink-soft">
              <li>
                <Link href="/customer/profile" className="hover:text-ink transition">
                  My Account Profile
                </Link>
              </li>
              <li>
                <Link href="/customer/profile?tab=orders" className="hover:text-ink transition">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link href="/customer/profile?tab=support" className="hover:text-ink transition">
                  Support Center Chat
                </Link>
              </li>
              <li>
                <Link href="/customer/wishlist" className="hover:text-ink transition">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/customer/cart" className="hover:text-ink transition">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/customer/profile?tab=addresses" className="hover:text-ink transition">
                  Saved Delivery Addresses
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate & Staff */}
          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-ink mb-4">
              Company & Staff
            </h5>
            <ul className="space-y-2.5 text-xs text-ink-soft">
              <li>
                <a href="#" className="hover:text-ink transition">
                  About Voltra Inc.
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-ink transition">
                  Press & Newsroom
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-ink transition">
                  Careers & Openings
                </a>
              </li>
              <li>
                <Link href="/staff/dashboard" className="inline-flex items-center gap-1 font-semibold text-ink hover:text-neon-dark transition">
                  Staff Portal Access <ArrowUpRight size={12} />
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-ink transition">
                  Sustainability Commitments
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-ink transition">
                  Investor Relations
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Sub-Footer Bar ── */}
        <div className="flex flex-col gap-4 border-t border-ink/10 pt-6 text-xs text-ink-soft md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-ink">© 2026 Voltra Inc. All rights reserved.</span>
            <a href="#" className="hover:text-ink transition">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-ink transition">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#" className="hover:text-ink transition">
              Security & Trust
            </a>
            <span>•</span>
            <a href="#" className="hover:text-ink transition">
              Cookie Preferences
            </a>
          </div>

          <div className="flex items-center gap-2 text-ink font-semibold bg-white/70 px-3 py-1.5 rounded-full border border-ink/5 text-[11px] self-start md:self-auto">
            <Globe size={13} className="text-ink-muted" />
            <span>Global / United States (USD $)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
