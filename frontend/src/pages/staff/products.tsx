import Head from "next/head";
import { useState } from "react";
import { StaffShell } from "@/components/layouts/StaffShell";
import { usePermission } from "@/hooks/usePermission";
import { useProducts } from "@/modules/products/hooks/useProducts";
import { useDeleteProduct } from "@/modules/products/hooks/useManageProducts";
import { ProductFormModal } from "@/components/staff/ProductFormModal";
import { ProductManageModal } from "@/components/staff/ProductManageModal";
import { Settings2, Search, Trash2 } from "lucide-react";

export default function StaffProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const { data, isLoading } = useProducts({ page, limit: 20, search });
  const deleteProduct = useDeleteProduct();

  const canCreate = usePermission("product:create");
  const canUpdate = usePermission("product:update");
  const canDelete = usePermission("product:delete");

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct.mutate(id);
    }
  };

  return (
    <>
      <Head>
        <title>Products — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Product Catalog</h1>
              <p className="text-sm text-ink-soft">Manage your product listings, options, and variants.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-all focus:border-neon focus:ring-1 focus:ring-neon"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {canCreate && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold whitespace-nowrap"
                >
                  + Add Product
                </button>
              )}
            </div>
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
                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
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
                    data.data.map((product: any) => {
                      const imgUrl = product.images?.[0]?.url || product.images?.[0]?.imageUrl || null;

                      return (
                        <tr key={product.id} className="transition-colors hover:bg-white/60">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-slate-100 grid place-items-center">
                                {imgUrl ? (
                                  <img src={imgUrl} alt={product.name} className="h-full w-full object-contain p-1" />
                                ) : (
                                  <Settings2 size={16} className="text-ink-muted" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-ink">{product.name}</div>
                                <div className="text-xs text-ink-muted">{product.slug}</div>
                              </div>
                            </div>
                          </td>
                        <td className="px-6 py-4 text-ink-muted">
                          {product.category?.name || "Uncategorized"}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ${Number(product.basePrice).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-ink-muted">
                          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink">
                            {product.variants?.length || 0} variants
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              product.status === "ACTIVE" || (product.status as string) === "PUBLISHED"
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
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm hover:border-neon hover:bg-neon/10 transition"
                            >
                              <Settings2 size={14} className="text-ink-soft" /> Manage Variants
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                title="Delete product"
                                className="grid h-8 w-8 place-items-center rounded-xl border border-transparent text-rose-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
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

        {/* Add Product Modal */}
        <ProductFormModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

        {/* Manage Options & Variants Modal */}
        <ProductManageModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      </StaffShell>
    </>
  );
}
