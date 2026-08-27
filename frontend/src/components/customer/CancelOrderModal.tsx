import React, { useState } from "react";
import { X, AlertTriangle, Loader2, XCircle, FileText, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => void;
}

const CANCEL_REASONS = [
  "Ordered by mistake / Duplicate order",
  "Found a better price elsewhere",
  "Shipping & delivery time is too long",
  "Incorrect item, color, or specification selected",
  "Payment or billing issue",
  "Other reason",
];

export function CancelOrderModal({ isOpen, onClose, order, onSuccess }: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order?.id || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await api.post(`/orders/me/${order.id}/cancel`, {
        reason: selectedReason,
        description: description.trim() || `Customer cancelled with reason: ${selectedReason}`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to cancel order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const orderNum = order.orderNumber || order.id?.slice(0, 8);
  const totalAmount = Number(order.total || order.totalAmount || 0).toFixed(2);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 z-20 grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink hover:bg-ink/10 transition"
        >
          <X size={18} />
        </button>

        <div className="overflow-y-auto custom-scrollbar p-6 md:p-8 pr-5 flex-1">

        {/* Header */}
        <div className="flex items-start gap-4 border-b border-ink/10 pb-5 pr-8">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-500/10 text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-ink">Cancel Order #{orderNum}</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Initiate order cancellation & automated refund request for <span className="font-bold text-ink">${totalAmount}</span>
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
              Select Cancellation Reason <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {CANCEL_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer text-xs ${
                    selectedReason === r
                      ? "border-rose-500 bg-rose-500/5 text-ink font-semibold"
                      : "border-ink/10 bg-white/60 text-ink-soft hover:bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="accent-rose-500 h-4 w-4"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes / Detailed Explanation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1">
              Additional Details / Notes <span className="text-ink-muted text-[10px] font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about why you want to cancel this order..."
              className="w-full rounded-2xl border border-ink/10 bg-white p-3 text-xs text-ink placeholder:text-ink-muted outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition resize-none"
            />
          </div>

          {/* Refund Info Notice */}
          <div className="rounded-2xl bg-amber-500/10 p-3.5 border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2.5">
            <FileText size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Automated Refund Policy</p>
              <p className="text-[11px] mt-0.5 opacity-90">
                Cancelling this order will generate a pending refund request of <span className="font-bold">${totalAmount}</span> to your original payment method.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-ink-soft hover:bg-ink/5 transition"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-rose-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg hover:bg-rose-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Cancelling...
                </>
              ) : (
                <>
                  <XCircle size={15} /> Confirm & Request Refund
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
