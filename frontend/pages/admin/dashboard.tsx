import Head from "next/head";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Settings2 } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";

const METRICS = [
  { label: "Total Sales", value: "$248.4K", delta: "+12.4%", up: true },
  { label: "Active Subscriptions", value: "1.76K", delta: "+4.1%", up: true },
  { label: "Gross Margin", value: "$8.80K", delta: "-1.2%", up: false },
  { label: "Active Returns", value: "115", delta: "+8.3%", up: false },
];

const USERS = [
  { name: "Sarah Chen", role: "Operations Lead", status: "Active", ts: "May 24, 2026" },
  { name: "Marc Devereux", role: "Dealer Manager", status: "Active", ts: "May 23, 2026" },
  { name: "Ana Karenina", role: "Support", status: "Offline", ts: "May 22, 2026" },
  { name: "Jin Park", role: "Engineering", status: "Active", ts: "May 22, 2026" },
  { name: "Olivia Brett", role: "Finance", status: "Offline", ts: "May 21, 2026" },
];

const ORDERS = [
  { id: "#VLT-83102", status: "In transit", total: "$1,899", color: "text-amber-600" },
  { id: "#VLT-83099", status: "Delivered", total: "$148", color: "text-emerald-600" },
  { id: "#VLT-83087", status: "Processing", total: "$2,640", color: "text-sky-600" },
  { id: "#VLT-83085", status: "Returned", total: "$549", color: "text-rose-600" },
  { id: "#VLT-83080", status: "Delivered", total: "$86", color: "text-emerald-600" },
];

function Spark() {
  return (
    <svg viewBox="0 0 120 36" className="h-9 w-full">
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,28 L15,22 L30,26 L45,14 L60,18 L75,10 L90,16 L105,6 L120,12 L120,36 L0,36 Z" fill="url(#g1)" />
      <path d="M0,28 L15,22 L30,26 L45,14 L60,18 L75,10 L90,16 L105,6 L120,12" fill="none" stroke="#10B981" strokeWidth="1.5" />
    </svg>
  );
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Command Center</h1>
        <p className="text-sm text-ink-soft">Real-time view of platform health and revenue.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="glass p-5">
            <div className="flex items-center justify-between text-xs text-ink-soft">
              {m.label}
              <MoreHorizontal size={14} />
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-ink">{m.value}</div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {m.up ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <ArrowUpRight size={12} />
                  {m.delta}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-600">
                  <ArrowDownRight size={12} />
                  {m.delta}
                </span>
              )}
              <span className="text-ink-muted">vs last week</span>
            </div>
            <div className="mt-3">
              <Spark />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="glass p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">User Management</h3>
            <button className="rounded-full bg-white/70 px-3 py-1.5 text-xs text-ink">Export</button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-ink/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/60 text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Activity</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {USERS.map((u) => (
                  <tr key={u.name} className="text-ink-soft hover:bg-white/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-xs font-medium text-white font-sans">
                          {u.name[0]}
                        </span>
                        <span className="font-medium text-ink">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ${
                          u.status === "Active" ? "bg-emerald-500/15 text-emerald-700" : "bg-ink/5 text-ink-muted"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.status === "Active" ? "bg-emerald-500" : "bg-ink-muted"
                          }`}
                        />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{u.ts}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="grid h-7 w-7 place-items-center rounded-lg bg-white/70 text-ink-soft hover:text-ink">
                        <Settings2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">Order Tracking</h3>
            <button className="text-xs text-ink-soft hover:text-ink">View all</button>
          </div>
          <div className="mt-4 space-y-2">
            {ORDERS.map((o) => (
              <div key={o.id} className="glass-soft flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-medium text-ink">{o.id}</div>
                  <div className={`text-xs ${o.color}`}>{o.status}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-sm font-bold text-ink">{o.total}</div>
                  <button className="text-[10px] font-semibold uppercase tracking-wider text-ink hover:text-emerald-600">
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <>
      <Head>
        <title>Admin Dashboard — Voltra</title>
      </Head>
      <AdminShell portal="Admin">
        <AdminDashboard />
      </AdminShell>
    </>
  );
}
