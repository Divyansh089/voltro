import { useState } from "react";
import { useSupportDashboard } from "../hooks/useSupportDashboard";
import { useSupportCharts } from "../hooks/useSupportCharts";
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
  Cell,
} from "recharts";
import { LifeBuoy, MessageSquare, AlertCircle, UserCheck, Inbox, Clock } from "lucide-react";

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

const CATEGORY_COLORS = ["#EC4899", "#8B5CF6", "#3B82F6", "#F59E0B", "#10B981", "#06B6D4"];

export function SupportDashboard() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading: isDashLoading, isError: isDashError } = useSupportDashboard();

  const [ticketTf, setTicketTf] = useState<"day" | "month" | "year">("day");
  const { data: supportChartsData } = useSupportCharts(ticketTf);

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
        <p className="text-sm text-rose-600">Failed to load support dashboard data.</p>
      </div>
    );
  }

  const timelineSeries = supportChartsData?.ticketTimeline || [];
  const categorySeries = supportChartsData?.categoryDistribution || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-sm text-ink-soft">
          Customer complaint tracking and ticket analytics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard
          label="My Open Tickets"
          value={dashboardData.overview.myOpenTickets}
          icon={UserCheck}
          iconBg="bg-sky-500/15"
          iconColor="text-sky-700"
          subtext="Assigned to you"
        />
        <KpiCard
          label="Unassigned Tickets"
          value={dashboardData.overview.unassignedTickets}
          icon={Inbox}
          iconBg="bg-purple-500/15"
          iconColor="text-purple-700"
          subtext="Awaiting agent"
        />
        <KpiCard
          label="Total Open Tickets"
          value={dashboardData.overview.totalOpenTickets}
          icon={LifeBuoy}
          iconBg="bg-pink-500/15"
          iconColor="text-pink-700"
          subtext="Active queue"
        />
        <KpiCard
          label="SLA Breaches"
          value={dashboardData.overview.slaBreaches}
          icon={Clock}
          iconBg={dashboardData.overview.slaBreaches > 0 ? "bg-amber-500/15" : "bg-emerald-500/15"}
          iconColor={dashboardData.overview.slaBreaches > 0 ? "text-amber-700" : "text-emerald-700"}
          deltaColor={dashboardData.overview.slaBreaches > 0 ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}
          delta={dashboardData.overview.slaBreaches > 0 ? "> 24h unresolved" : "All clear"}
        />
      </div>

      {/* 1. Open Support Tickets Line Chart */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <LifeBuoy size={18} className="text-purple-600" />
              <h3 className="font-display text-lg font-bold text-ink">Support Ticket Creation Trend</h3>
            </div>
            <p className="text-xs text-ink-soft">Volume of customer tickets created per timeframe</p>
          </div>
          <TimeframeSelector value={ticketTf} onChange={setTicketTf} />
        </div>

        <div className="h-72 w-full pt-2">
          {timelineSeries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-ink-muted">
              No support tickets created for this timeframe.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} tickets`,
                    name === "openTickets" ? "Open Tickets" : "Total Tickets",
                  ]}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
                <Line
                  type="monotone"
                  dataKey="openTickets"
                  name="Open Tickets"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#8B5CF6" }}
                  activeDot={{ r: 6, fill: "#7C3AED" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Support Ticket Category Distribution Bar Chart */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-pink-600" />
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Complaints & Tickets by Category</h3>
            <p className="text-xs text-ink-soft">Distribution of customer support issues across categories</p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {categorySeries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-ink-muted">
              No ticket categories recorded.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySeries} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="category"
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
                        transform="rotate(-20)"
                      >
                        {payload.value}
                      </text>
                    </g>
                  )}
                />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} complaints/tickets`, "Count"]}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="count" fill="#EC4899" radius={[6, 6, 0, 0]}>
                  {categorySeries.map((_: any, index: number) => (
                    <Cell key={`cat-ticket-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
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
