import Link from "next/link";
import { useRouter } from "next/router";
import { LayoutDashboard, Activity, Users, Package, Settings, LogOut, Search, Bell, Zap } from "lucide-react";

const ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/status", label: "System Status", icon: Activity },
  { to: "/admin/dashboard", label: "Users", icon: Users },
  { to: "/admin/dashboard", label: "Orders", icon: Package },
  { to: "/admin/dashboard", label: "Settings", icon: Settings },
] as const;

export function AdminShell({ portal = "Admin", children }: { portal?: string; children?: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1500px] gap-5 px-4 pt-4 pb-10">
        {/* Sidebar */}
        <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col p-5 lg:flex">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white">
              <Zap size={16} strokeWidth={2} />
            </span>
            <div>
              <div className="font-display text-lg font-bold text-ink">Voltra</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-muted">{portal} Portal</div>
            </div>
          </Link>

          <nav className="mt-8 space-y-1">
            {ITEMS.map((it, i) => {
              const active = router.pathname === it.to;
              return (
                <Link
                  key={i}
                  href={it.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active ? "bg-ink text-white" : "text-ink-soft hover:bg-white/60 hover:text-ink"
                  }`}
                >
                  <it.icon size={16} strokeWidth={1.6} />
                  {it.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto glass-soft p-4">
            <div className="text-xs font-semibold text-ink">Need help?</div>
            <p className="mt-1 text-xs text-ink-soft">Check the operations runbook for incident playbooks.</p>
            <button className="btn-neon mt-3 inline-flex w-full items-center justify-center gap-2 py-2 text-xs">
              Open Runbook
            </button>
          </div>

          <Link href="/" className="mt-4 inline-flex items-center gap-2 px-3 py-2 text-xs text-ink-soft hover:text-ink">
            <LogOut size={14} /> Exit portal
          </Link>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Topbar */}
          <header className="glass flex items-center gap-3 px-5 py-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                className="h-10 w-full rounded-full border border-ink/5 bg-white/70 pl-9 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-neon/60 focus:outline-none"
                placeholder="Search orders, users, SKUs..."
              />
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-ink-soft">
              <Bell size={14} />
            </button>
            <div className="flex items-center gap-3 rounded-full bg-white/70 py-1 pl-1 pr-4">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#FCD9B6] to-[#3B2A20] text-xs text-white">R</span>
              <div className="text-xs">
                <div className="font-semibold text-ink">Ryman Alex</div>
                <div className="text-ink-muted">{portal}</div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
