import { useProductDashboard } from "../hooks/useProductDashboard";
import { KpiCard } from "@/components/shared/KpiCard";
import { useAuth } from "@/providers/AuthProvider";

export function ProductManagerDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useProductDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass animate-pulse p-5 h-24" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="glass p-5">
        <p className="text-sm text-rose-600">
          Failed to load product dashboard data. Please try again.
        </p>
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
          Product analytics and inventory health overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard label="Total Products" value={data.overview.totalProducts} />
        <KpiCard label="Categories" value={data.overview.totalCategories} />
        <KpiCard
          label="Low Stock Alerts"
          value={data.overview.lowStockVariants}
          deltaColor={
            data.overview.lowStockVariants > 0 ? "text-amber-600" : "text-emerald-600"
          }
          delta={data.overview.lowStockVariants > 0 ? "Needs attention" : "All stocked"}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Top Products */}
        <div className="glass p-5">
          <h3 className="font-display text-lg font-semibold text-ink">
            Top Selling Products
          </h3>
          <p className="text-xs text-ink-soft">Ranked by units sold</p>
          <div className="mt-4 space-y-2">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-ink-muted">No sales data yet.</p>
            ) : (
              data.topProducts.map((p, i) => (
                <div
                  key={p.name}
                  className="glass-soft flex items-center justify-between p-3"
                >
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

        {/* Products by Category */}
        <div className="glass p-5">
          <h3 className="font-display text-lg font-semibold text-ink">
            Category Distribution
          </h3>
          <p className="text-xs text-ink-soft">Products per category</p>
          <div className="mt-4 space-y-2">
            {data.productsByCategory.length === 0 ? (
              <p className="text-sm text-ink-muted">No categories yet.</p>
            ) : (
              data.productsByCategory.map((c) => (
                <div
                  key={c.categoryName}
                  className="glass-soft flex items-center justify-between p-3"
                >
                  <span className="text-sm font-medium text-ink">{c.categoryName}</span>
                  <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                    {c.count} products
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
