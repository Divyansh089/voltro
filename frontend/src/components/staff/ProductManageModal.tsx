import { useState } from "react";
import { X, Plus, Trash2, Tag, Layers, Package, Power } from "lucide-react";
import { ProductOptionsPanel } from "./ProductOptionsPanel";
import { VariantFormModal } from "./VariantFormModal";
import {
  useProductVariants,
  useToggleVariantActive,
  useDeleteVariant,
} from "@/modules/products/hooks/useProductOptions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    category?: {
      name: string;
      hasVariants: boolean;
    };
  } | null;
}

export function ProductManageModal({ isOpen, onClose, product }: Props) {
  const [activeTab, setActiveTab] = useState<"options" | "variants">("variants");
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  const productId = product?.id ?? null;
  const hasVariants = product?.category?.hasVariants ?? true;

  const { data: variantsData, isLoading: variantsLoading } = useProductVariants(productId);
  const variants = variantsData?.variants ?? [];

  const toggleActive = useToggleVariantActive();
  const deleteVariant = useDeleteVariant(productId || "");

  if (!isOpen || !product) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md">
        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5 bg-ink/[0.02]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-ink">{product.name}</h2>
                <span className="rounded-full bg-neon/20 px-2.5 py-0.5 text-[10px] font-bold text-neon-dark uppercase tracking-wider">
                  ${Number(product.basePrice).toFixed(2)} Base
                </span>
                {!hasVariants && (
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                    Single Product (No Variants)
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-soft mt-0.5">Category: {product.category?.name || "General"}</p>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink-soft hover:bg-ink/10 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          {hasVariants && (
            <div className="flex border-b border-ink/10 bg-white px-6">
              <button
                onClick={() => setActiveTab("variants")}
                className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition ${
                  activeTab === "variants"
                    ? "border-neon text-ink"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                <Layers size={14} /> Variants ({variants.length})
              </button>
              <button
                onClick={() => setActiveTab("options")}
                className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition ${
                  activeTab === "options"
                    ? "border-neon text-ink"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                <Tag size={14} /> Option Dimensions (Color, RAM, etc.)
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {hasVariants && activeTab === "options" && (
              <ProductOptionsPanel productId={product.id} productBasePrice={Number(product.basePrice)} />
            )}

            {(!hasVariants || activeTab === "variants") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">SKU & Inventory Variants</h3>
                    <p className="text-xs text-ink-soft">
                      {hasVariants
                        ? "Combinations of options with their own SKU, pricing, and stock levels."
                        : "Single default variant created for stock tracking."}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsVariantModalOpen(true)}
                    className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                  >
                    <Plus size={14} /> {hasVariants ? "Add New Variant" : "Add Initial Stock"}
                  </button>
                </div>

                {variantsLoading ? (
                  <div className="py-8 text-center text-xs text-ink-muted">Loading variants...</div>
                ) : variants.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-ink/15 py-10 text-center">
                    <Package size={32} className="mx-auto mb-2 text-ink-muted" />
                    <p className="text-sm font-semibold text-ink">No variants created yet</p>
                    <p className="text-xs text-ink-soft mt-1">
                      {hasVariants
                        ? "First define option dimensions (Color, RAM, Storage), then add variant combinations."
                        : "Click 'Add Initial Stock' to create default SKU inventory."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
                    <table className="w-full text-left text-xs text-ink">
                      <thead className="border-b border-ink/5 bg-ink/[0.02] uppercase text-[10px] text-ink-soft">
                        <tr>
                          <th className="px-4 py-3 font-semibold">SKU / Variant Name</th>
                          <th className="px-4 py-3 font-semibold">Options</th>
                          <th className="px-4 py-3 font-semibold">Final Price</th>
                          <th className="px-4 py-3 font-semibold">Stock</th>
                          <th className="px-4 py-3 font-semibold">Active</th>
                          <th className="px-4 py-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5">
                        {variants.map((v) => (
                          <tr key={v.id} className="hover:bg-ink/[0.01]">
                            <td className="px-4 py-3">
                              <div className="font-mono font-bold text-ink">{v.sku}</div>
                              <div className="text-[11px] text-ink-soft">{v.name}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {v.options && v.options.length > 0 ? (
                                  v.options.map((opt, i) => (
                                    <span
                                      key={i}
                                      className="rounded-md bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink-soft"
                                    >
                                      {opt.optionName}: <strong className="text-ink">{opt.value}</strong>
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-ink-muted">Default</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-ink">
                              ${Number(v.price).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`font-semibold ${
                                  (v.inventory?.quantity ?? 0) > 10
                                    ? "text-emerald-600"
                                    : (v.inventory?.quantity ?? 0) > 0
                                    ? "text-amber-600"
                                    : "text-rose-600"
                                }`}
                              >
                                {v.inventory?.quantity ?? 0} units
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() =>
                                  toggleActive.mutate({
                                    variantId: v.id,
                                    productId: product.id,
                                    isActive: !v.isActive,
                                  })
                                }
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                                  v.isActive
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                }`}
                              >
                                <Power size={10} />
                                {v.isActive ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  if (confirm(`Delete variant SKU ${v.sku}?`)) {
                                    deleteVariant.mutate(v.id);
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-700 transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Variant Modal */}
      <VariantFormModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        productId={product.id}
        productName={product.name}
        productBasePrice={Number(product.basePrice)}
        hasVariants={hasVariants}
      />
    </>
  );
}
