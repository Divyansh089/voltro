import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { KpiCard } from "@/components/shared/KpiCard";
import { useAuth } from "@/providers/AuthProvider";

export function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass animate-pulse p-5 h-24" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="glass p-5">
        <p className="text-sm text-rose-600">Failed to load admin dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-sm text-ink-soft">
          Global operations and revenue overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard label="Total Revenue" value={`$${Number(data.overview.totalRevenue).toFixed(2)}`} />
        <KpiCard label="Total Orders" value={data.overview.totalOrders} />
        <KpiCard label="Total Users" value={data.overview.totalUsers} />
        <KpiCard label="New Users" value={data.overview.newUsers} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Recent Orders */}
        <div className="glass p-5">
          <h3 className="font-display text-lg font-semibold text-ink">Recent Orders</h3>
          <div className="mt-4 space-y-2">
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-ink-muted">No orders yet.</p>
            ) : (
              data.recentOrders.map((o) => (
                <div key={o.id} className="glass-soft flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm font-medium text-ink">{o.orderNumber}</div>
                    <div className="text-xs text-ink-soft">{o.customerEmail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ink">${Number(o.total).toFixed(2)}</div>
                    <div className="text-[10px] uppercase tracking-wider text-neon">
                      {o.status.replace("_", " ")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="glass p-5">
          <h3 className="font-display text-lg font-semibold text-ink">Top Selling Products</h3>
          <div className="mt-4 space-y-2">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-ink-muted">No sales data yet.</p>
            ) : (
              data.topProducts.map((p, i) => (
                <div key={p.name} className="glass-soft flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-neon/30 text-xs font-bold text-ink">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-ink">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ink">{p.sold} sold</div>
                    <div className="text-[10px] text-ink-muted">
                      ${Number(p.revenue).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
