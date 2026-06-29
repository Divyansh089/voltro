import Head from "next/head";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/AdminShell";

const EVENTS = [
  { ts: "12:42", level: "ok", title: "Global Payment Gateway Online", body: "All regions reporting healthy throughput." },
  { ts: "12:18", level: "warn", title: "Elevated p95 latency in EU-WEST", body: "Auto-scaling has provisioned 4 additional nodes." },
  { ts: "11:55", level: "ok", title: "Image CDN purged successfully", body: "Cache hit ratio back to 98.2%." },
  { ts: "11:24", level: "err", title: "Webhook delivery failing for dealer-#218", body: "Retrying with exponential backoff. Investigate destination endpoint." },
  { ts: "10:50", level: "ok", title: "Nightly backups completed", body: "Snapshots replicated to 3 regions." },
  { ts: "10:21", level: "warn", title: "Inventory sync lag detected", body: "Re-syncing with vendor feed; ETA 4 minutes." },
];

const INITIAL_TOGGLES = [
  { name: "Maintenance mode", on: false },
  { name: "Read-only API", on: false },
  { name: "Verbose audit log", on: true },
  { name: "Auto-scaling", on: true },
  { name: "Beta dealer hub", on: true },
  { name: "Critical alert SMS", on: false },
];

function Status() {
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <div className="glass p-5 xl:col-span-2">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Event feed</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            All systems operational
          </span>
        </div>
        <ol className="mt-5 space-y-3">
          {EVENTS.map((e, i) => {
            const Icon = e.level === "ok" ? CheckCircle2 : e.level === "warn" ? AlertTriangle : XCircle;
            const color = e.level === "ok" ? "text-emerald-600" : e.level === "warn" ? "text-amber-600" : "text-rose-600";
            return (
              <li key={i} className="glass-soft flex gap-4 p-4">
                <Icon size={18} className={color} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-ink">{e.title}</div>
                    <div className="text-xs text-ink-muted">{e.ts}</div>
                  </div>
                  <div className="mt-1 text-xs text-ink-soft">{e.body}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="glass p-5">
        <h3 className="font-display text-lg font-semibold text-ink">Global Settings</h3>
        <p className="text-xs text-ink-soft">Toggle infrastructure-wide capabilities.</p>
        <div className="mt-5 space-y-2">
          {toggles.map((t, i) => (
            <div key={t.name} className="glass-soft flex items-center justify-between p-3">
              <div className="text-sm text-ink">{t.name}</div>
              <button
                onClick={() =>
                  setToggles((s) => s.map((x, idx) => (idx === i ? { ...x, on: !x.on } : x)))
                }
                className={`relative h-6 w-11 rounded-full transition ${t.on ? "bg-neon" : "bg-ink/10"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    t.on ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <button className="btn-neon mt-5 w-full py-2.5 text-sm">Save Changes</button>
      </div>
    </div>
  );
}

function SystemStatus() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">System Status & Notifications</h1>
        <p className="text-sm text-ink-soft">Live telemetry across the Voltra platform.</p>
      </div>
      <Status />
    </div>
  );
}

export default function AdminStatusPage() {
  return (
    <>
      <Head>
        <title>System Status — Voltra</title>
      </Head>
      <AdminShell portal="Admin">
        <SystemStatus />
      </AdminShell>
    </>
  );
}
