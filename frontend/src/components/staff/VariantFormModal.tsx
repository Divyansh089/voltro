import { useState, useMemo } from "react";
import { X, Loader2, DollarSign, Package } from "lucide-react";
import {
  useProductOptions,
  useCreateVariant,
  ProductOption,
} from "@/modules/products/hooks/useProductOptions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productBasePrice: number;
  hasVariants: boolean;  // false for accessories/drones
}

export function VariantFormModal({
  isOpen,
  onClose,
  productId,
  productName,
  productBasePrice,
  hasVariants,
}: Props) {
  const { data: options = [] } = useProductOptions(hasVariants ? productId : null);
  const createVariant = useCreateVariant(productId);

  // Selection map: optionId → valueId
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [sku, setSku] = useState("");
  const [initialStock, setInitialStock] = useState("0");
  const [errorMsg, setErrorMsg] = useState("");

  // Compute total price from selection
  const { computedPrice, priceBreakdown } = useMemo(() => {
    let total = productBasePrice;
    const breakdown: { label: string; delta: number }[] = [];
    for (const option of options) {
      const selectedValueId = selectedValues[option.id];
      if (selectedValueId) {
        const val = option.values.find((v) => v.id === selectedValueId);
        if (val) {
          const delta = Number(val.priceDelta);
          breakdown.push({ label: `${option.name}: ${val.value}`, delta });
          total += delta;
        }
      }
    }
    return { computedPrice: total, priceBreakdown: breakdown };
  }, [selectedValues, options, productBasePrice]);

  // Auto-generate SKU from selected values
  const autoSkuSuffix = useMemo(() => {
    const parts: string[] = [];
    for (const option of options) {
      const val = option.values.find((v) => v.id === selectedValues[option.id]);
      if (val) parts.push(val.value.replace(/\s+/g, "-").toUpperCase().slice(0, 5));
    }
    return parts.join("-");
  }, [selectedValues, options]);

  const allOptionsSelected = options.every((opt) => !!selectedValues[opt.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!sku.trim()) {
      setErrorMsg("SKU is required");
      return;
    }

    if (hasVariants && !allOptionsSelected && options.length > 0) {
      setErrorMsg("Please select a value for every option");
      return;
    }

    try {
      const payload: any = {
        sku: sku.trim(),
        initialStock: parseInt(initialStock) || 0,
      };

      if (hasVariants && options.length > 0) {
        payload.optionValueIds = Object.values(selectedValues);
      }

      await createVariant.mutateAsync(payload);
      onClose();
      setSelectedValues({});
      setSku("");
      setInitialStock("0");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to create variant");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-ink/10 bg-white p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              {hasVariants ? "Add Variant" : "Add Default Stock"}
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink-soft hover:bg-ink/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          
          {/* Option Selectors (only for variant products) */}
          {hasVariants && options.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide">
                Select Options
              </p>
              {options.map((option: ProductOption) => (
                <div key={option.id}>
                  <label className="mb-1.5 block text-xs font-semibold text-ink">
                    {option.name} <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((val) => {
                      const isSelected = selectedValues[option.id] === val.id;
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() =>
                            setSelectedValues((prev) => ({
                              ...prev,
                              [option.id]: isSelected ? "" : val.id,
                            }))
                          }
                          className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? "border-neon bg-neon/10 text-ink"
                              : "border-ink/10 text-ink-soft hover:border-neon hover:text-ink"
                          }`}
                        >
                          {val.value}
                          {Number(val.priceDelta) > 0 && (
                            <span className="ml-1 text-[10px] text-ink-muted">
                              +${Number(val.priceDelta).toFixed(0)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {option.values.length === 0 && (
                      <p className="text-xs text-rose-500">No values defined for this option yet.</p>
                    )}
                  </div>
                </div>
              ))}

              {hasVariants && options.length === 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-700 font-medium">
                    No options defined yet. Add options (Color, RAM, etc.) in the Options panel first.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Price Preview */}
          {hasVariants && options.length > 0 && (
            <div className="rounded-xl border border-ink/10 bg-ink/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14} className="text-ink-soft" />
                <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Price Breakdown</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-soft">Base price</span>
                  <span className="font-medium text-ink">${productBasePrice.toFixed(2)}</span>
                </div>
                {priceBreakdown.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-ink-soft">{b.label}</span>
                    <span className="font-medium text-ink">
                      {b.delta === 0 ? "Included" : `+$${b.delta.toFixed(2)}`}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-ink/10 pt-2 text-sm font-bold text-ink">
                  <span>Total SKU Price</span>
                  <span className="text-neon-dark">${computedPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* SKU and Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink">
                SKU <span className="text-rose-500">*</span>
                {autoSkuSuffix && (
                  <button
                    type="button"
                    onClick={() => setSku(autoSkuSuffix)}
                    className="text-[10px] font-normal text-neon-dark hover:underline"
                  >
                    Use auto: {autoSkuSuffix}
                  </button>
                )}
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. VLP-SG-16-512"
                className="h-10 w-full rounded-xl border border-ink/10 bg-white px-3 text-sm text-ink font-mono uppercase outline-none focus:border-neon focus:ring-2 focus:ring-neon/20"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-ink">
                <Package size={12} /> Initial Stock
              </label>
              <input
                type="number"
                min="0"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="h-10 w-full rounded-xl border border-ink/10 bg-white px-3 text-sm text-ink outline-none focus:border-neon focus:ring-2 focus:ring-neon/20"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-ink/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ink/10 px-5 py-2.5 text-xs font-semibold text-ink-soft hover:bg-ink/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createVariant.isPending}
              className="btn-neon inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold disabled:opacity-50"
            >
              {createVariant.isPending ? (
                <><Loader2 size={13} className="animate-spin" /> Creating...</>
              ) : (
                "Create Variant"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
