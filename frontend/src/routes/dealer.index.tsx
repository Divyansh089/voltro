import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Trophy, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/dealer/")({
  component: DealerHome,
  head: () => ({ meta: [{ title: "Dealer Portal — Voltra" }] }),
});

const KPIS = [
  { label: "Bulk Orders (MTD)", value: "1,284", delta: "+18%" },
  { label: "Commission Earned", value: "$42.6K", delta: "+9.4%" },
  { label: "Active SKUs", value: "184", delta: "+3" },
  { label: "Avg Fulfillment", value: "1.8d", delta: "-0.4d" },
];

const ORDERS = [
  { id: "DLR-9201", sku: "Voltra Phone 15", qty: 240, total: "$215,760", tier: "Platinum" },
  { id: "DLR-9198", sku: "Sequoia Headphone", qty: 180, total: "$26,640", tier: "Gold" },
  { id: "DLR-9194", sku: "Voltra Book Pro", qty: 60, total: "$113,940", tier: "Platinum" },
  { id: "DLR-9190", sku: "X-Bud", qty: 500, total: "$43,000", tier: "Silver" },
  { id: "DLR-9182", sku: "Lumen Pro VR", qty: 120, total: "$65,880", tier: "Gold" },
];

function Bars() {
  const data = [40, 65, 32, 70, 48, 88, 62, 74, 55];
  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-neon/40 to-neon" style={{ height: `${v}%` }} />
      ))}
    </div>
  );
}

function DealerHome() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Dealer Portal Overview</h1>
          <p className="text-sm text-ink-soft">Wholesale operations and commission center.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-neon/30 px-3 py-1.5 text-xs font-semibold text-ink">
          <Trophy size={12} /> Platinum Partner · Tier 1
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="glass p-5">
            <div className="flex items-center justify-between text-xs text-ink-soft">
              {k.label} <MoreHorizontal size={14} />
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-ink">{k.value}</div>
            <div className="mt-1 text-xs text-emerald-600">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="glass p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">Wholesale order queue</h3>
            <button className="rounded-full bg-white/70 px-3 py-1.5 text-xs text-ink">Filter</button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-ink/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/60 text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {ORDERS.map((o) => (
                  <tr key={o.id} className="text-ink-soft hover:bg-white/40">
                    <td className="px-4 py-3 font-medium text-ink">{o.id}</td>
                    <td className="px-4 py-3">{o.sku}</td>
                    <td className="px-4 py-3">{o.qty}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{o.total}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        o.tier === "Platinum" ? "bg-neon/30 text-ink" : o.tier === "Gold" ? "bg-amber-400/25 text-amber-700" : "bg-ink/5 text-ink-soft"
                      }`}>{o.tier}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="grid h-7 w-7 place-items-center rounded-lg bg-white/70 text-ink-soft hover:text-ink">
                        <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass p-5">
          <h3 className="font-display text-lg font-semibold text-ink">Performance</h3>
          <p className="text-xs text-ink-soft">9-month turnover trend</p>
          <div className="mt-5"><Bars /></div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[{ k: "Volume", v: "+24%" }, { k: "Margin", v: "+8%" }, { k: "Returns", v: "1.2%" }].map((s) => (
              <div key={s.k} className="glass-soft p-3">
                <div className="font-display text-lg font-bold text-ink">{s.v}</div>
                <div className="text-[10px] uppercase tracking-wider text-ink-muted">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
