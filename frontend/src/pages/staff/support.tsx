import Head from "next/head";
import { useState } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useAdminTickets } from "@/modules/support/hooks/useAdminTickets";
import { useUpdateTicket } from "@/modules/support/hooks/useUpdateTicket";
import { usePermission } from "@/hooks/usePermission";

import api from "@/lib/api";
import { Search, Copy, Check } from "lucide-react";

function CopyOrderIdButton({ orderId }: { orderId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy Order / Reference ID"
      className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-ink/10 transition group"
    >
      <span>{orderId}</span>
      {copied ? (
        <Check size={13} className="text-emerald-600 shrink-0" />
      ) : (
        <Copy size={13} className="text-ink-muted group-hover:text-ink shrink-0" />
      )}
    </button>
  );
}

export default function StaffSupportPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminTickets({ page, limit: 20, search });
  const { mutate: updateTicket, isPending: isUpdating } = useUpdateTicket();
  const canUpdate = usePermission("ticket:reply");

  const handleStatusChange = (id: string, newStatus: string) => {
    updateTicket({ id, status: newStatus as any });
  };

  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const handleSendStaffReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket?.id || !replyMessage.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      await api.post(`/tickets/${selectedTicket.id}/messages`, {
        message: replyMessage.trim(),
      });
      setReplyMessage("");
      // Refetch ticket details
      const res: any = await api.get(`/tickets/${selectedTicket.id}`);
      setSelectedTicket(res.data?.data || res.data);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <>
      <Head>
        <title>Support Queue — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Support Queue</h1>
              <p className="text-sm text-ink-soft">Manage and reply to customer support tickets.</p>
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
              <input
                type="text"
                placeholder="Search support tickets or order IDs..."
                className="w-full rounded-xl border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-all focus:border-neon focus:ring-1 focus:ring-neon"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-ink/5 bg-ink/5 text-xs uppercase text-ink-soft">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Subject</th>
                    <th className="px-6 py-4 font-semibold">Order / Ref ID</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
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
                          {ticket.orderId ? (
                            <CopyOrderIdButton orderId={ticket.orderId} />
                          ) : (
                            <span className="text-xs text-ink-muted font-medium">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              ticket.status === "CLOSED"
                                ? "bg-slate-200 text-slate-700"
                                : ticket.status === "IN_PROGRESS"
                                ? "bg-blue-500/20 text-blue-700"
                                : "bg-neon/30 text-neon-dark"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const res: any = await api.get(`/tickets/${ticket.id}`);
                                  setSelectedTicket(res.data?.data || res.data || ticket);
                                } catch (e) {
                                  setSelectedTicket(ticket);
                                }
                              }}
                              className="rounded-lg bg-ink px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                            >
                              Chat / Reply
                            </button>
                            {canUpdate && (
                              <CustomSelect
                                size="sm"
                                disabled={isUpdating}
                                value={ticket.status}
                                onChange={(val) => handleStatusChange(ticket.id, val)}
                                options={[
                                  { value: "OPEN", label: "Open" },
                                  { value: "IN_PROGRESS", label: "In Progress" },
                                  { value: "CLOSED", label: "Closed" },
                                ]}
                              />
                            )}
                          </div>
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

          {/* Staff Chat Drawer Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-md animate-fadeIn">
              <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-ink/10 flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink">{selectedTicket.subject}</h3>
                    <p className="text-xs text-ink-soft">
                      Customer: {selectedTicket.user?.email} • Category: {selectedTicket.category}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-ink/5 text-ink hover:bg-ink/10"
                  >
                    ✕
                  </button>
                </div>

                {/* Message Stream */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-50 my-4 rounded-2xl">
                  {selectedTicket.replies?.length ? (
                    selectedTicket.replies.map((m: any) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.isStaffReply ? "items-end" : "items-start"}`}
                      >
                        <div className="text-[10px] text-ink-muted mb-0.5">
                          {m.isStaffReply ? "Staff Reply" : "Customer"} • {new Date(m.createdAt).toLocaleTimeString()}
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                            m.isStaffReply
                              ? "bg-ink text-white rounded-tr-none"
                              : "bg-white border border-ink/10 text-ink rounded-tl-none"
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-ink-muted">No messages in ticket queue.</div>
                  )}
                </div>

                {/* Staff Reply Form / Locked Closed State */}
                {selectedTicket?.status === "CLOSED" ? (
                  <div className="p-3.5 bg-slate-100 border border-ink/10 rounded-2xl text-center text-xs font-bold text-ink-muted flex items-center justify-center gap-2 select-none">
                    🔒 Ticket is closed. Typing and replies are disabled.
                  </div>
                ) : (
                  <form onSubmit={handleSendStaffReply} className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type staff response..."
                      className="flex-1 rounded-xl border border-ink/10 bg-slate-50 px-3.5 py-2 text-xs text-ink outline-none focus:border-neon"
                    />
                    <button
                      type="submit"
                      disabled={isSendingReply || !replyMessage.trim()}
                      className="btn-neon px-4 py-2 text-xs font-bold disabled:opacity-50"
                    >
                      {isSendingReply ? "Sending..." : "Send Reply"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </StaffShell>
    </>
  );
}
