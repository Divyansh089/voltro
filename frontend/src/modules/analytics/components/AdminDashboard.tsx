import { useState } from "react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { useAdminCharts } from "../hooks/useAdminCharts";
import { KpiCard } from "@/components/shared/KpiCard";
import { useAuth } from "@/providers/AuthProvider";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, ShoppingBag, Users, UserPlus } from "lucide-react";

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

export function AdminDashboard() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading: isDashLoading, isError: isDashError } = useAdminDashboard();

  const [revenueLineTf, setRevenueLineTf] = useState<"day" | "month" | "year">("day");
  const [revenueBarTf, setRevenueBarTf] = useState<"day" | "month" | "year">("day");
  const [comparisonTf, setComparisonTf] = useState<"day" | "month" | "year">("day");

  const { data: lineChartData } = useAdminCharts(revenueLineTf);
  const { data: barChartData } = useAdminCharts(revenueBarTf);
  const { data: comparisonData } = useAdminCharts(comparisonTf);

  if (isDashLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass animate-pulse p-5 h-24" />
        ))}
      </div>
    );
  }

  if (isDashError || !dashboardData) {
    return (
      <div className="glass p-5">
        <p className="text-sm text-rose-600">Failed to load admin dashboard data.</p>
      </div>
    );
  }

  const lineSeries = lineChartData?.chartData || [];
  const barSeries = barChartData?.chartData || [];
  const compSeries = comparisonData?.chartData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-sm text-ink-soft">
          Executive financial performance & revenue metrics.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={`$${Number(dashboardData.overview.totalRevenue).toFixed(2)}`}
          icon={DollarSign}
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-700"
          subtext="Gross store sales"
        />
        <KpiCard
          label="Total Orders"
          value={dashboardData.overview.totalOrders}
          icon={ShoppingBag}
          iconBg="bg-sky-500/15"
          iconColor="text-sky-700"
          subtext="Fulfilled & processing"
        />
        <KpiCard
          label="Total Users"
          value={dashboardData.overview.totalUsers}
          icon={Users}
          iconBg="bg-purple-500/15"
          iconColor="text-purple-700"
          subtext="Registered accounts"
        />
        <KpiCard
          label="New Customers"
          value={dashboardData.overview.newUsers}
          icon={UserPlus}
          iconBg="bg-amber-500/15"
          iconColor="text-amber-700"
          subtext="Recent signups"
        />
      </div>

      {/* 1. Revenue Line Chart */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              <h3 className="font-display text-lg font-bold text-ink">Revenue Growth Trend</h3>
            </div>
            <p className="text-xs text-ink-soft">Gross sales performance over time</p>
          </div>
          <TimeframeSelector value={revenueLineTf} onChange={setRevenueLineTf} />
        </div>

        <div className="h-72 w-full pt-2">
          {lineSeries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-ink-muted">
              No revenue data recorded for this timeframe.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, "Revenue"]}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10B981" }}
                  activeDot={{ r: 6, fill: "#059669" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grid: Bar Chart & Income vs Refund Comparison Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 2. Revenue Bar Chart */}
        <div className="glass p-6 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-sky-600" />
                <h3 className="font-display text-base font-bold text-ink">Interval Revenue Breakdown</h3>
              </div>
              <p className="text-xs text-ink-soft">Volume comparison per time period</p>
            </div>
            <TimeframeSelector value={revenueBarTf} onChange={setRevenueBarTf} />
          </div>

          <div className="h-72 w-full pt-2">
            {barSeries.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-ink-muted">
                No revenue data recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, "Revenue"]}
                    contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. Income vs Refund (Outcome) Comparative Bar Chart */}
        <div className="glass p-6 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ArrowUpRight size={18} className="text-emerald-600" />
                <ArrowDownRight size={18} className="text-rose-600 -ml-3" />
                <h3 className="font-display text-base font-bold text-ink">Income vs Refund (Outflow)</h3>
              </div>
              <p className="text-xs text-ink-soft">Upward green = Sales Income | Downward red = Refunds</p>
            </div>
            <TimeframeSelector value={comparisonTf} onChange={setComparisonTf} />
          </div>

          <div className="h-72 w-full pt-2">
            {compSeries.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-ink-muted">
                No financial records for this timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `$${Math.abs(val)}`} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `$${Math.abs(Number(val)).toFixed(2)}`,
                      name === "income" ? "Sales Income (+)" : "Refund Outflow (-)",
                    ]}
                    contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1.5} />
                  <Bar dataKey="income" name="Income (+)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="refund" name="Refund (-)" fill="#EF4444" radius={[0, 0, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
