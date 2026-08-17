import { useState } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { X, Tag, Loader2, Sparkles } from "lucide-react";
import { useCreateCoupon } from "@/modules/coupons/hooks/useCoupons";

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CouponFormModal({ isOpen, onClose }: CouponFormModalProps) {
  const { mutate: createCoupon, isPending } = useCreateCoupon();

  const todayStr = new Date().toISOString().split("T")[0];
  const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<string>("20");
  const [minOrderAmount, setMinOrderAmount] = useState<string>("0");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<string>("1000");
  const [perUserLimit, setPerUserLimit] = useState<string>("1");
  const [validFrom, setValidFrom] = useState(todayStr);
  const [validUntil, setValidUntil] = useState(nextMonthStr);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError("Coupon code is required");
      return;
    }

    const numValue = Number(discountValue);
    if (isNaN(numValue) || numValue <= 0) {
      setFormError("Discount value must be a positive number");
      return;
    }

    const payload = {
      code: cleanCode,
      description: description.trim() || undefined,
      discountType,
      discountValue: numValue,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : 1000,
      perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
      isActive,
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(`${validUntil}T23:59:59.999Z`).toISOString(),
    };

    createCoupon(payload, {
      onSuccess: () => {
        onClose();
        resetForm();
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || err.message || "Failed to create coupon";
        setFormError(msg);
      },
    });
  };

  const resetForm = () => {
    setCode("");
    setDescription("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("20");
    setMinOrderAmount("0");
    setMaxDiscountAmount("");
    setUsageLimit("1000");
    setPerUserLimit("1");
    setValidFrom(todayStr);
    setValidUntil(nextMonthStr);
    setIsActive(true);
    setFormError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-ink/10 bg-white p-6 shadow-2xl md:p-8">
        
        {/* Header matching ProductFormModal */}
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Create Promo Coupon</h2>
            <p className="text-xs text-ink-soft">Add a new discount code for staff & customer promotions.</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form matching ProductFormModal */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {formError && (
            <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 border border-rose-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Coupon Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER50"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm font-mono uppercase font-bold text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Discount Type <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                options={[
                  { value: "PERCENTAGE", label: "Percentage (%)" },
                  { value: "FIXED_AMOUNT", label: "Fixed Amount ($)" },
                ]}
                value={discountType}
                onChange={(val) => setDiscountType(val as any)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Description / Promotion Title
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 50% discount for summer catalog sale"
              className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Value ({discountType === "PERCENTAGE" ? "%" : "$"}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="20"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm font-bold text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Min Order ($)</label>
              <input
                type="number"
                min={0}
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="0"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Max Cap ($)</label>
              <input
                type="number"
                min={0}
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                placeholder="Optional"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Total Usage Limit</label>
              <input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="1000"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Limit Per Customer</label>
              <input
                type="number"
                min={1}
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                placeholder="1"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DatePicker
              label="Start Date *"
              required
              value={validFrom}
              onChange={setValidFrom}
              placeholder="Select start date"
              minYear={2020}
              maxYear={2050}
            />

            <DatePicker
              label="Expiration Date *"
              required
              value={validUntil}
              onChange={setValidUntil}
              placeholder="Select expiration date"
              minYear={2020}
              maxYear={2050}
              disablePast
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActiveToggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-ink/20 accent-[#CCFF00]"
            />
            <label htmlFor="isActiveToggle" className="text-xs font-semibold text-ink cursor-pointer">
              Enable Coupon Immediately
            </label>
          </div>

          {/* Footer Buttons matching ProductFormModal */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-soft hover:bg-ink/5 hover:text-ink transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-neon inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold shadow-md disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isPending ? "Creating Coupon..." : "Publish Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
