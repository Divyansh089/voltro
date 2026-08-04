import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useAuth } from "@/providers/AuthProvider";
import { ROLES } from "@/constants";
import { useSalesChart } from "@/modules/analytics/hooks/useSalesChart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StaffAnalyticsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useSalesChart();

  // Only ADMIN can access this page
  if (user?.role !== ROLES.ADMIN) {
    return (
      <>
        <Head>
          <title>Analytics — Voltra Staff</title>
        </Head>
        <StaffShell>
          <div className="glass p-8 text-center">
            <h2 className="font-display text-xl font-bold text-ink">Access Restricted</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Financial analytics are restricted to administrators.
            </p>
          </div>
        </StaffShell>
      </>
    );
  }

  // Calculate total revenue from chart data
  const totalRevenue = data?.data?.reduce((acc, curr) => acc + curr.revenue, 0) || 0;

  return (
    <>
      <Head>
        <title>Financial Analytics — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Financial Analytics</h1>
            <p className="text-sm text-ink-soft">Revenue, users, and platform-wide metrics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-ink-soft">30-Day Revenue</h3>
              <div className="mt-2 text-3xl font-bold text-ink">
                ${totalRevenue.toFixed(2)}
              </div>
            </div>
            {/* Additional metric cards could go here */}
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="mb-6 font-display font-semibold text-ink">Revenue Over Time (30 Days)</h3>
            <div className="h-[400px] w-full">
              {isLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                  Loading chart...
                </div>
              ) : !data?.data?.length ? (
                <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                  No revenue data found for this period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c3ff00" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#c3ff00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#666", fontSize: 12 }} 
                      tickFormatter={(str) => {
                        const d = new Date(str);
                        return `${d.getMonth()+1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#666", fontSize: 12 }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      labelFormatter={(str) => new Date(str).toLocaleDateString()}
                      formatter={(val: number) => [`$${val.toFixed(2)}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#c3ff00" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </StaffShell>
    </>
  );
}
