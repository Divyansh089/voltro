import { useState, useEffect } from "react";
import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useAuth } from "@/providers/AuthProvider";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  DollarSign,
  User,
  ShoppingBag,
  Loader2,
  FileText,
  AlertCircle,
  Filter,
} from "lucide-react";
import api from "@/lib/api";

export default function StaffRefundsPage() {
  const { user } = useAuth();
  const userRole = String((user as any)?.role || "");

  const [refunds, setRefunds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  if (userRole === "PRODUCT_MANAGER") {
    return (
      <StaffShell>
        <div className="glass p-12 text-center max-w-lg mx-auto mt-12 rounded-2xl">
          <h2 className="font-display text-xl font-bold text-ink">Access Restricted</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Refunds are managed exclusively by Customer Support specialists. Product Managers handle catalog items and inventory.
          </p>
        </div>
      </StaffShell>
    );
  }

  // Moderation Modal State
  const [actionModal, setActionModal] = useState<{
    refund: any;
    status: "APPROVED" | "REJECTED";
  } | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRefunds = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (selectedStatus !== "ALL") params.status = selectedStatus;
      if (search.trim()) params.search = search.trim();

      const res: any = await api.get("/refunds", { params });
      const payload = res.data?.data || res.data;

      if (Array.isArray(payload)) {
        setRefunds(payload);
        setTotalPages(res.data?.meta?.totalPages || 1);
      } else if (Array.isArray(payload?.items || payload?.refunds)) {
        setRefunds(payload?.items || payload?.refunds);
        setTotalPages(res.data?.meta?.totalPages || 1);
      } else {
        setRefunds([]);
      }
    } catch (err) {
      console.warn("Failed to fetch refund requests:", err);
      setRefunds([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [page, selectedStatus, search]);

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.patch(`/refunds/${actionModal.refund.id}/status`, {
        status: actionModal.status,
        adminNotes: adminNotes.trim(),
      });
      setActionModal(null);
      setAdminNotes("");
      fetchRefunds();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update refund status");
    } finally {
      setIsSubmitting(false);
    }
  };

  // KPI Computations
  const totalCount = refunds.length;
  const pendingCount = refunds.filter((r) => r.status === "PENDING").length;
  const totalAmountSum = refunds
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return (
    <StaffShell>
      <Head>
        <title>Refund Requests — Voltra Staff Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Refund Requests Management
          </h1>
          <p className="text-sm text-ink-soft">
            Review, approve, or reject customer cancellation refund requests.
          </p>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass p-5 rounded-2xl flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-700">
              <Clock size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">Pending Review</span>
              <div className="font-display text-2xl font-extrabold text-ink">{pendingCount}</div>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-700">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">Approved Value</span>
              <div className="font-display text-2xl font-extrabold text-ink">${totalAmountSum.toFixed(2)}</div>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/15 text-blue-700">
              <ShoppingBag size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">Total Requests</span>
              <div className="font-display text-2xl font-extrabold text-ink">{totalCount}</div>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white/60 p-1.5 rounded-xl border border-ink/5 text-xs font-bold">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedStatus(st);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  selectedStatus === st
                    ? "bg-ink text-white shadow-sm"
                    : "text-ink-soft hover:bg-ink/5"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Search by order #, email, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-white/80 pl-9 pr-4 py-2 text-xs text-ink placeholder:text-ink-muted outline-none focus:border-neon focus:ring-2 focus:ring-neon/20 transition"
            />
          </div>
        </div>

        {/* Refund Requests Table */}
        <div className="glass overflow-hidden rounded-3xl border border-white/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/40 border-b border-ink/5 font-bold uppercase tracking-wider text-ink-muted text-[10px]">
                <tr>
                  <th className="px-6 py-4">Order & Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Reason & Description</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink-soft font-semibold">
                      <Loader2 size={20} className="mx-auto animate-spin text-neon-dark mb-2" />
                      Loading refund requests...
                    </td>
                  </tr>
                ) : refunds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink-soft">
                      <AlertCircle size={28} className="mx-auto text-ink-muted/40 mb-2" />
                      No refund requests found.
                    </td>
                  </tr>
                ) : (
                  refunds.map((r: any) => {
                    const customerName =
                      `${r.user?.customerProfile?.firstName || ""} ${r.user?.customerProfile?.lastName || ""}`.trim() ||
                      r.user?.email ||
                      "Customer";
                    const orderNum = r.order?.orderNumber || `ORD-${r.orderId?.slice(0, 8)}`;
                    const isPending = r.status === "PENDING";

                    return (
                      <tr key={r.id} className="hover:bg-white/40 transition">
                        {/* Order & Customer */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-ink text-sm">#{orderNum}</div>
                          <div className="text-ink-soft font-medium">{customerName}</div>
                          <div className="text-[10px] text-ink-muted font-mono">{r.user?.email}</div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          <div className="font-display font-extrabold text-sm text-ink">
                            ${Number(r.amount || 0).toFixed(2)}
                          </div>
                        </td>

                        {/* Reason & Description */}
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-bold text-ink">{r.reason}</div>
                          {r.description && (
                            <div className="text-ink-soft text-[11px] truncate mt-0.5" title={r.description}>
                              {r.description}
                            </div>
                          )}
                          {r.adminNotes && (
                            <div className="mt-1 text-[10px] italic text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                              Admin: {r.adminNotes}
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-ink-soft font-mono">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                              r.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-700"
                                : r.status === "REJECTED"
                                ? "bg-rose-500/20 text-rose-700"
                                : "bg-amber-500/20 text-amber-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setActionModal({ refund: r, status: "APPROVED" })}
                                className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition flex items-center gap-1"
                              >
                                <CheckCircle2 size={13} /> Approve
                              </button>
                              <button
                                onClick={() => setActionModal({ refund: r, status: "REJECTED" })}
                                className="rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-500/20 border border-rose-200 transition flex items-center gap-1"
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-ink-muted italic">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Moderation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-ink/10 space-y-4">
            <h3 className="font-display text-lg font-bold text-ink">
              {actionModal.status === "APPROVED" ? "Approve Refund Request" : "Reject Refund Request"}
            </h3>
            <p className="text-xs text-ink-soft">
              Order <span className="font-bold">#{actionModal.refund.order?.orderNumber || actionModal.refund.orderId}</span> • Amount: <span className="font-bold text-ink">${Number(actionModal.refund.amount).toFixed(2)}</span>
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1">
                  Staff Notes / Resolution Reason <span className="text-ink-muted text-[10px] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter staff processing notes..."
                  className="w-full rounded-2xl border border-ink/10 bg-white p-3 text-xs text-ink outline-none focus:border-neon focus:ring-2 focus:ring-neon/20 transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-soft hover:bg-ink/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow transition flex items-center gap-1.5 ${
                    actionModal.status === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : actionModal.status === "APPROVED" ? (
                    "Confirm Approval"
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffShell>
  );
}
