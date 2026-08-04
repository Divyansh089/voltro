import Head from "next/head";
import { useState } from "react";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useAdminTickets } from "@/modules/support/hooks/useAdminTickets";
import { useUpdateTicket } from "@/modules/support/hooks/useUpdateTicket";
import { usePermission } from "@/hooks/usePermission";

export default function StaffSupportPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminTickets({ page, limit: 20 });
  const { mutate: updateTicket, isPending: isUpdating } = useUpdateTicket();
  const canUpdate = usePermission("ticket:reply");

  const handleStatusChange = (id: string, newStatus: string) => {
    updateTicket({ id, status: newStatus as any });
  };

  return (
    <>
      <Head>
        <title>Support Queue — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Support Queue</h1>
            <p className="text-sm text-ink-soft">Manage and reply to customer support tickets.</p>
          </div>

          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-ink/5 bg-ink/5 text-xs uppercase text-ink-soft">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Subject</th>
                    <th className="px-6 py-4 font-semibold">Priority</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 bg-white/40">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-ink-muted">
                        Loading tickets...
                      </td>
                    </tr>
                  ) : !data?.data?.length ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-ink-muted">
                        No support tickets found.
                      </td>
                    </tr>
                  ) : (
                    data.data.map((ticket: any) => (
                      <tr key={ticket.id} className="transition-colors hover:bg-white/60">
                        <td className="px-6 py-4">
                          <div className="font-medium">
                            {ticket.user?.customerProfile?.firstName} {ticket.user?.customerProfile?.lastName}
                          </div>
                          <div className="text-xs text-ink-muted">{ticket.user?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{ticket.subject}</div>
                          <div className="text-xs text-ink-muted">{ticket.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              ticket.priority === "URGENT" || ticket.priority === "HIGH"
                                ? "bg-red-500/20 text-red-700"
                                : ticket.priority === "MEDIUM"
                                ? "bg-amber-500/20 text-amber-700"
                                : "bg-ink/10 text-ink-soft"
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                                ? "bg-neon/20 text-neon-dark"
                                : ticket.status === "WAITING_ON_CUSTOMER"
                                ? "bg-amber-500/20 text-amber-700"
                                : "bg-blue-500/20 text-blue-700"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {canUpdate && (
                            <select
                              className="rounded-lg border border-ink/10 bg-white px-2 py-1 text-xs text-ink focus:border-neon focus:outline-none disabled:opacity-50"
                              value={ticket.status}
                              onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                              disabled={isUpdating}
                            >
                              <option value="OPEN">Open</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="WAITING_ON_CUSTOMER">Waiting on Customer</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="CLOSED">Closed</option>
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
