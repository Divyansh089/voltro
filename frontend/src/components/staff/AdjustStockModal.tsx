import { useState, useMemo } from "react";
import { X, Loader2, Package, ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAdjustInventory } from "@/modules/inventory/hooks/useAdjustInventory";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: {
    variantId: string;
    quantity: number;
    reservedQuantity?: number;
    variant?: {
      sku: string;
      name: string;
      product?: {
        name: string;
      };
    };
  } | null;
}

const PRESET_REASONS = [
  "New Shipment / Restock",
  "Cycle Count Correction",
  "Damaged / Written Off",
  "Customer Return",
  "Manual Audit Adjustment",
];

export function AdjustStockModal({ isOpen, onClose, item }: Props) {
  const { mutate: adjustInventory, isPending } = useAdjustInventory();

  const [mode, setMode] = useState<"ADD" | "SUBTRACT" | "SET">("ADD");
  const [amountStr, setAmountStr] = useState("10");
  const [reason, setReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const currentQuantity = item?.quantity ?? 0;

  // Calculate net adjustment amount and preview new quantity
  const { netAdjustment, newQuantity } = useMemo(() => {
    const rawVal = parseInt(amountStr, 10);
    if (isNaN(rawVal)) return { netAdjustment: 0, newQuantity: currentQuantity };

    if (mode === "ADD") {
      const adj = Math.abs(rawVal);
      return { netAdjustment: adj, newQuantity: currentQuantity + adj };
    } else if (mode === "SUBTRACT") {
      const adj = -Math.abs(rawVal);
      return { netAdjustment: adj, newQuantity: Math.max(0, currentQuantity + adj) };
    } else {
      // SET EXACT
      const target = Math.max(0, rawVal);
      return { netAdjustment: target - currentQuantity, newQuantity: target };
    }
  }, [amountStr, mode, currentQuantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!item?.variantId) return;

    if (netAdjustment === 0) {
      setErrorMsg("Adjustment amount cannot be zero.");
      return;
    }

    const finalReason = customReason.trim() || reason;

    adjustInventory(
      {
        variantId: item.variantId,
        adjustment: netAdjustment,
        reason: finalReason,
      },
      {
        onSuccess: () => {
          onClose();
          setAmountStr("10");
          setCustomReason("");
        },
        onError: (err: any) => {
          setErrorMsg(err?.response?.data?.message || "Failed to adjust inventory.");
        },
      }
    );
  };

  if (!isOpen || !item) return null;

  const productName = item.variant?.product?.name || "Product";
  const variantName = item.variant?.name || "Default";
  const sku = item.variant?.sku || "";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-ink/10 bg-white p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Adjust Inventory Stock</h2>
            <p className="text-xs text-ink-soft mt-0.5">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink-soft hover:bg-ink/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="my-4 rounded-2xl border border-ink/10 bg-ink/[0.02] p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-ink">{variantName}</div>
            <div className="text-[11px] font-mono text-ink-muted">SKU: {sku}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-ink-soft">Current Available</div>
            <div className="font-display text-lg font-bold text-ink">{currentQuantity} units</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Mode Tabs: Add / Subtract / Set Exact */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">Adjustment Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode("ADD")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                  mode === "ADD"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                    : "border-ink/10 text-ink-soft hover:bg-ink/5"
                }`}
              >
                <ArrowUpRight size={14} /> Add (+)
              </button>
              <button
                type="button"
                onClick={() => setMode("SUBTRACT")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                  mode === "SUBTRACT"
                    ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                    : "border-ink/10 text-ink-soft hover:bg-ink/5"
                }`}
              >
                <ArrowDownRight size={14} /> Remove (-)
              </button>
              <button
                type="button"
                onClick={() => setMode("SET")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                  mode === "SET"
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-ink/10 text-ink-soft hover:bg-ink/5"
                }`}
              >
                <RefreshCw size={14} /> Set Exact (=)
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              {mode === "ADD" ? "Quantity to Add" : mode === "SUBTRACT" ? "Quantity to Remove" : "Target Exact Quantity"}
            </label>
            <div className="relative">
              <Package size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="number"
                min="1"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="h-11 w-full rounded-xl border border-ink/10 bg-white pl-10 pr-4 text-sm font-semibold text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/20"
              />
            </div>
          </div>

          {/* New Resulting Stock Preview */}
          <div className="rounded-xl border border-neon/30 bg-neon/10 p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-neon-dark" /> Resulting Available Stock:
            </span>
            <span className="font-display text-base font-bold text-neon-dark">
              {newQuantity} units
            </span>
          </div>

          {/* Preset Reason Chips */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">Reason for Adjustment</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setReason(r);
                    setCustomReason("");
                  }}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                    reason === r && !customReason
                      ? "border-neon bg-neon text-ink"
                      : "border-ink/10 text-ink-soft hover:border-neon/50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or enter custom reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="h-9 w-full rounded-xl border border-ink/10 bg-white px-3 text-xs text-ink outline-none focus:border-neon focus:ring-2 focus:ring-neon/20"
            />
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ink/10 px-5 py-2.5 text-xs font-semibold text-ink-soft hover:bg-ink/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-neon inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                "Confirm Adjustment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
