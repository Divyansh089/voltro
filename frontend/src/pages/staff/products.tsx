import Head from "next/head";
import { useState } from "react";
import { StaffShell } from "@/components/layouts/StaffShell";
import { usePermission } from "@/hooks/usePermission";
import { useProducts } from "@/modules/products/hooks/useProducts";

export default function StaffProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProducts({ page, limit: 20 });
  const canCreate = usePermission("product:create");
  const canUpdate = usePermission("product:update");
  const canDelete = usePermission("product:delete");

  return (
    <>
      <Head>
        <title>Products — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Product Catalog</h1>
              <p className="text-sm text-ink-soft">Manage your product listings and variants.</p>
            </div>
            {canCreate && (
              <button className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-sm">
                + Add Product
              </button>
            )}
          </div>

          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-ink/5 bg-ink/5 text-xs uppercase text-ink-soft">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Product Name</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Base Price</th>
                    <th className="px-6 py-4 font-semibold">Variants</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 bg-white/40">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-ink-muted">
                        Loading products...
                      </td>
                    </tr>
                  ) : !data?.data?.length ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-ink-muted">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    data.data.map((product: any) => (
                      <tr key={product.id} className="transition-colors hover:bg-white/60">
                        <td className="px-6 py-4">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-ink-muted">{product.slug}</div>
                        </td>
                        <td className="px-6 py-4 text-ink-muted">
                          {product.category?.name || "Uncategorized"}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ${Number(product.basePrice).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-ink-muted">
                          {product._count?.variants || 0}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              product.status === "PUBLISHED"
                                ? "bg-neon/20 text-neon-dark"
                                : product.status === "DRAFT"
                                ? "bg-amber-500/20 text-amber-700"
                                : "bg-ink/10 text-ink-soft"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {canUpdate && (
                              <button className="text-xs font-semibold text-ink-soft hover:text-neon">
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button className="text-xs font-semibold text-ink-soft hover:text-red-500">
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
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
      </StaffShell>
    </>
  );
}
