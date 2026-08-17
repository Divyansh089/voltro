import { useState } from "react";
import { useProductDashboard } from "../hooks/useProductDashboard";
import { useProductCharts } from "../hooks/useProductCharts";
import { KpiCard } from "@/components/shared/KpiCard";
import { useAuth } from "@/providers/AuthProvider";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Package, Layers, ShoppingBag, AlertTriangle } from "lucide-react";

function TimeframeSelector({
  value,
  onChange,
}: {
  value: "day" | "month" | "year";
  onChange: (val: "day" | "month" | "year") => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-ink/5 p-1 border border-ink/5">
      {(["day", "month", "year"] as const).map((tf) => (
        <button
          key={tf}
          type="button"
          onClick={() => onChange(tf)}
          className={`px-3 py-1 text-xs font-bold capitalize transition-all rounded-lg ${
            value === tf
              ? "bg-white text-ink shadow-sm"
              : "text-ink-soft hover:text-ink hover:bg-white/50"
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}

const BAR_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4"];

export function ProductManagerDashboard() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading: isDashLoading, isError: isDashError } = useProductDashboard();

  const [salesTf, setSalesTf] = useState<"day" | "month" | "year">("day");
  const { data: productChartsData } = useProductCharts(salesTf);

  if (isDashLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass animate-pulse p-5 h-24" />
        ))}
      </div>
    );
  }

  if (isDashError || !dashboardData) {
    return (
      <div className="glass p-5">
        <p className="text-sm text-rose-600">
          Failed to load product dashboard data. Please try again.
        </p>
      </div>
    );
  }

  const productSales = productChartsData?.productSalesPerformance || [];
  const categoryInventory = productChartsData?.categoryInventory || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-sm text-ink-soft">
          Product sales performance and stock level monitoring.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          label="Total Products"
          value={dashboardData.overview.totalProducts}
          icon={Package}
          iconBg="bg-blue-500/15"
          iconColor="text-blue-700"
          subtext="Active catalog items"
        />
        <KpiCard
          label="Total Categories"
          value={dashboardData.overview.totalCategories}
          icon={Layers}
          iconBg="bg-purple-500/15"
          iconColor="text-purple-700"
          subtext="Product classifications"
        />
        <KpiCard
          label="Low Stock Alerts"
          value={dashboardData.overview.lowStockVariants}
          icon={AlertTriangle}
          iconBg={dashboardData.overview.lowStockVariants > 0 ? "bg-amber-500/15" : "bg-emerald-500/15"}
          iconColor={dashboardData.overview.lowStockVariants > 0 ? "text-amber-700" : "text-emerald-700"}
          deltaColor={dashboardData.overview.lowStockVariants > 0 ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}
          delta={dashboardData.overview.lowStockVariants > 0 ? "Needs restock attention" : "All stocked"}
        />
      </div>

      {/* 1. Product Sales Performance Bar / Chart (Only soldQuantity > 0) */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-neon-dark" />
              <h3 className="font-display text-lg font-bold text-ink">Product Units Sold</h3>
            </div>
            <p className="text-xs text-ink-soft">
              Products with active sales (Quantity sold &gt; 0)
            </p>
          </div>
          <TimeframeSelector value={salesTf} onChange={setSalesTf} />
        </div>

        <div className="h-72 w-full pt-2">
          {productSales.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center rounded-2xl bg-white/40 border border-ink/5 space-y-1">
              <Package size={28} className="text-ink-muted" />
              <p className="text-xs font-bold text-ink">No units sold during this timeframe</p>
              <p className="text-[11px] text-ink-soft">Try switching to Month or Year view.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productSales} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={12}
                        textAnchor="end"
                        fill="#64748B"
                        fontSize={10}
                        transform="rotate(-25)"
                      >
                        {payload.value.length > 18 ? `${payload.value.slice(0, 16)}...` : payload.value}
                      </text>
                    </g>
                  )}
                />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} units (${name === "quantitySold" ? "Sold" : "Units"})`,
                    "Quantity",
                  ]}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="quantitySold" fill="#10B981" radius={[6, 6, 0, 0]}>
                  {productSales.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Category Inventory Total Stock Bar Chart */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-sky-600" />
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Category Inventory Total Stock</h3>
            <p className="text-xs text-ink-soft">Accumulated stock count across all products in category</p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {categoryInventory.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-ink-muted">
              No categories found.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryInventory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="categoryName" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} items in stock`, "Total Stock"]}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="totalStock" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                  {categoryInventory.map((entry: any, index: number) => (
                    <Cell
                      key={`cat-cell-${index}`}
                      fill={entry.totalStock < 15 ? "#EF4444" : BAR_COLORS[index % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
