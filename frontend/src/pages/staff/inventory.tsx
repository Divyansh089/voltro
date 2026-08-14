import Head from "next/head";
import { useState } from "react";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useInventory } from "@/modules/inventory/hooks/useInventory";
import { usePermission } from "@/hooks/usePermission";
import { AdjustStockModal } from "@/components/staff/AdjustStockModal";
import { SlidersHorizontal, Search } from "lucide-react";

export default function StaffInventoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useInventory({ page, limit: 20, search });
  const canUpdate = usePermission("inventory:update");

  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  return (
    <>
      <Head>
        <title>Inventory — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Inventory Management</h1>
              <p className="text-sm text-ink-soft">Monitor stock levels and adjust variant quantities.</p>
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
              <input
                type="text"
                placeholder="Search inventory or SKU..."
                className="w-full rounded-xl border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-all focus:border-neon focus:ring-1 focus:ring-neon"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-ink/5 bg-ink/5 text-xs uppercase text-ink-soft">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold">SKU</th>
                    <th className="px-6 py-4 font-semibold">Available</th>
                    <th className="px-6 py-4 font-semibold">Reserved</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 bg-white/40">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-ink-muted">
                        Loading inventory...
                      </td>
                    </tr>
                  ) : !data?.data?.length ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-ink-muted">
                        No inventory records found.
                      </td>
                    </tr>
                  ) : (
                    data.data.map((item: any) => {
                      const isLowStock = item.quantity <= item.lowStockThreshold;
                      const isOutOfStock = item.quantity <= 0;

                      return (
                        <tr key={item.id} className="transition-colors hover:bg-white/60">
                          <td className="px-6 py-4">
                            <div className="font-medium">{item.variant?.product?.name}</div>
                            <div className="text-xs text-ink-muted">{item.variant?.name}</div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{item.variant?.sku}</td>
                          <td className="px-6 py-4 font-medium">{item.quantity}</td>
                          <td className="px-6 py-4 text-ink-muted">{item.reservedQuantity}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isOutOfStock
                                  ? "bg-red-500/20 text-red-700"
                                  : isLowStock
                                  ? "bg-amber-500/20 text-amber-700"
                                  : "bg-neon/20 text-neon-dark"
                              }`}
                            >
                              {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {canUpdate && (
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink shadow-sm transition hover:border-neon hover:bg-neon/10"
                              >
                                <SlidersHorizontal size={13} className="text-ink-soft" /> Adjust
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-ink/5 bg-white/40 px-6 py-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-ink/10 px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-white disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs text-ink-muted">
                  Page {page} of {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                  className="rounded-lg border border-ink/10 px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Adjust Stock Pop-up Modal */}
        <AdjustStockModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />
      </StaffShell>
    </>
  );
}
