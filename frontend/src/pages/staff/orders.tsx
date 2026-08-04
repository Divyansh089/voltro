import Head from "next/head";
import { useState } from "react";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useAdminOrders } from "@/modules/orders/hooks/useAdminOrders";
import { useUpdateOrderStatus } from "@/modules/orders/hooks/useUpdateOrderStatus";
import { usePermission } from "@/hooks/usePermission";

export default function StaffOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminOrders({ page, limit: 20 });
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  const canUpdate = usePermission("order:update");

  const handleStatusChange = (id: string, newStatus: string) => {
    if (confirm(`Change order status to ${newStatus}?`)) {
      updateStatus({ id, status: newStatus as any });
    }
  };

  return (
    <>
      <Head>
        <title>Orders — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Order Fulfillment</h1>
            <p className="text-sm text-ink-soft">View and manage customer orders.</p>
          </div>

          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-ink/5 bg-ink/5 text-xs uppercase text-ink-soft">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Total</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 bg-white/40">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-ink-muted">
                        Loading orders...
                      </td>
                    </tr>
                  ) : !data?.data?.length ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-ink-muted">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    data.data.map((order: any) => (
                      <tr key={order.id} className="transition-colors hover:bg-white/60">
                        <td className="px-6 py-4 font-medium">ORD-{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-6 py-4">
                          <div>{order.user?.customerProfile?.firstName} {order.user?.customerProfile?.lastName}</div>
                          <div className="text-xs text-ink-muted">{order.user?.email}</div>
                        </td>
                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium">${Number(order.total).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              order.status === "DELIVERED"
                                ? "bg-neon/20 text-neon-dark"
                                : order.status === "PENDING" || order.status === "PROCESSING"
                                ? "bg-amber-500/20 text-amber-700"
                                : order.status === "CANCELLED"
                                ? "bg-red-500/20 text-red-700"
                                : "bg-blue-500/20 text-blue-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {canUpdate && (
                            <select
                              className="rounded-lg border border-ink/10 bg-white px-2 py-1 text-xs text-ink focus:border-neon focus:outline-none disabled:opacity-50"
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={isUpdating}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          )}
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
