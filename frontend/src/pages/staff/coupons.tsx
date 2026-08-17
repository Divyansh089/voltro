import Head from "next/head";
import { useState } from "react";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useCoupons, useDeleteCoupon, useUpdateCoupon, type Coupon } from "@/modules/coupons/hooks/useCoupons";
import { CouponFormModal } from "@/components/staff/CouponFormModal";
import {
  Tag,
  Plus,
  Search,
  Loader2,
  Trash2,
  CheckCircle2,
  XCircle,
  Percent,
  DollarSign,
  Calendar,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function StaffCouponsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: responseData, isLoading, isError } = useCoupons({ search });
  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon();
  const { mutate: updateCoupon } = useUpdateCoupon();

  const couponsList: Coupon[] = Array.isArray(responseData?.data)
    ? responseData.data
    : Array.isArray(responseData)
    ? responseData
    : [];

  const activeCount = couponsList.filter((c) => c.isActive).length;

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete coupon code "${code}"?`)) {
      deleteCoupon(id);
    }
  };

  const handleToggleActive = (coupon: Coupon) => {
    updateCoupon({
      id: coupon.id,
      data: { isActive: !coupon.isActive },
    });
  };

  return (
    <>
      <Head>
        <title>Coupons & Discounts — Voltra Staff</title>
      </Head>

      <StaffShell>
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
                <Tag size={24} className="text-neon-dark" /> Coupons & Discounts
              </h1>
              <p className="text-xs text-ink-soft mt-0.5">
                Manage promotional codes, percentage discounts, and fixed vouchers for customers.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-neon inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-extrabold shadow-lg transition hover:scale-[1.01]"
            >
              <Plus size={16} /> Add Coupon
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass p-5 rounded-2xl flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-neon/20 text-neon-dark font-extrabold">
                <Tag size={22} />
              </div>
              <div>
                <span className="text-xs text-ink-soft block font-medium">Total Coupons</span>
                <span className="font-display text-2xl font-bold text-ink">{couponsList.length}</span>
              </div>
            </div>

            <div className="glass p-5 rounded-2xl flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-700 font-extrabold">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span className="text-xs text-ink-soft block font-medium">Active Promotions</span>
                <span className="font-display text-2xl font-bold text-emerald-700">{activeCount}</span>
              </div>
            </div>

            <div className="glass p-5 rounded-2xl flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-500/15 text-purple-700 font-extrabold">
                <Sparkles size={22} />
              </div>
              <div>
                <span className="text-xs text-ink-soft block font-medium">Discount Types</span>
                <span className="font-display text-base font-bold text-ink">Percentage & Fixed</span>
              </div>
            </div>
          </div>

          {/* Search Bar & Table Header */}
          <div className="glass overflow-hidden rounded-3xl">
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-ink/5 bg-white/40">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
                <input
                  type="text"
                  placeholder="Search by code or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-ink/10 bg-white/80 pl-10 pr-4 text-xs text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/40"
                />
              </div>

              <span className="text-xs font-semibold text-ink-muted">
                Showing {couponsList.length} coupon codes
              </span>
            </div>

            {/* Coupons Table */}
            {isLoading ? (
              <div className="flex items-center justify-center p-16 text-xs font-semibold text-ink-soft gap-2">
                <Loader2 size={18} className="animate-spin text-neon-dark" /> Loading database coupons...
              </div>
            ) : isError ? (
              <div className="p-12 text-center text-xs font-semibold text-rose-600">
                <AlertCircle size={24} className="mx-auto mb-2" /> Failed to load coupons from backend database.
              </div>
            ) : couponsList.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Tag size={36} className="mx-auto text-ink-muted/40" />
                <p className="text-xs font-bold text-ink">No promotional coupons found</p>
                <p className="text-[11px] text-ink-soft max-w-sm mx-auto">
                  Click "+ Add Coupon" above to create discount codes for your customers.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-ink">
                  <thead className="border-b border-ink/5 bg-ink/5 text-[11px] uppercase tracking-wider font-extrabold text-ink-soft">
                    <tr>
                      <th className="px-6 py-4">Promo Code</th>
                      <th className="px-6 py-4">Discount</th>
                      <th className="px-6 py-4">Min Order</th>
                      <th className="px-6 py-4">Usage Limit</th>
                      <th className="px-6 py-4">Valid Period</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {couponsList.map((coupon) => {
                      const isExpired = new Date(coupon.validUntil).getTime() < Date.now();
                      return (
                        <tr key={coupon.id} className="hover:bg-white/40 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-neon/20 px-2.5 py-1 font-mono text-xs font-extrabold text-neon-dark border border-neon/40 shadow-sm">
                                {coupon.code}
                              </span>
                            </div>
                            {coupon.description && (
                              <span className="text-[11px] text-ink-soft block mt-1 line-clamp-1">
                                {coupon.description}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 font-bold text-ink">
                            {coupon.discountType === "PERCENTAGE" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs">
                                <Percent size={13} /> {coupon.discountValue}% OFF
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-500/10 px-2.5 py-1 rounded-full text-xs">
                                <DollarSign size={13} /> ${Number(coupon.discountValue).toFixed(2)} OFF
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 font-semibold text-ink-soft">
                            {coupon.minOrderAmount && coupon.minOrderAmount > 0
                              ? `$${Number(coupon.minOrderAmount).toFixed(2)}`
                              : "No Minimum"}
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-semibold text-ink">
                              {coupon.usedCount || 0} / {coupon.usageLimit || "∞"}
                            </span>
                            <span className="text-[10px] block text-ink-muted">
                              ({coupon.perUserLimit || 1} per customer)
                            </span>
                          </td>

                          <td className="px-6 py-4 text-[11px] text-ink-soft space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-ink-muted" />
                              <span>{new Date(coupon.validFrom).toLocaleDateString()}</span>
                            </div>
                            <div className="text-ink-muted">
                              Until {new Date(coupon.validUntil).toLocaleDateString()}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {isExpired ? (
                              <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-extrabold text-rose-600 border border-rose-200">
                                EXPIRED
                              </span>
                            ) : coupon.isActive ? (
                              <button
                                onClick={() => handleToggleActive(coupon)}
                                className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 border border-emerald-300 hover:bg-emerald-500/25 transition"
                                title="Click to disable"
                              >
                                ACTIVE
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleActive(coupon)}
                                className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-extrabold text-slate-600 hover:bg-slate-300 transition"
                                title="Click to enable"
                              >
                                DISABLED
                              </button>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete(coupon.id, coupon.code)}
                              disabled={isDeleting}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-500/10"
                              title="Delete coupon"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create Coupon Modal */}
        <CouponFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </StaffShell>
    </>
  );
}
