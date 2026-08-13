import React, { useState, useEffect } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  X,
  Headset,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  User,
  Lock,
} from "lucide-react";
import api from "@/lib/api";

interface SupportQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTicket?: any;
  initialSubject?: string;
  initialCategory?: string;
  initialMessage?: string;
  initialOrderId?: string;
  onTicketCreated?: () => void;
}

const CATEGORIES = ["Refund", "Order Issue", "Product Inquiry", "Billing", "General"];

export function SupportQueryModal({
  isOpen,
  onClose,
  initialTicket,
  initialSubject = "",
  initialCategory = "Refund",
  initialMessage = "",
  initialOrderId = "",
  onTicketCreated,
}: SupportQueryModalProps) {
  const [activeTicket, setActiveTicket] = useState<any>(initialTicket || null);
  const [isNewQueryView, setIsNewQueryView] = useState(!initialTicket);

  // New Query Form state
  const [category, setCategory] = useState(initialCategory);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);
  const [orderId, setOrderId] = useState(initialOrderId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Chat message state
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (initialTicket) {
      setActiveTicket(initialTicket);
      setIsNewQueryView(false);
      fetchTicketDetails(initialTicket.id);
    } else {
      setIsNewQueryView(true);
      setSubject(initialSubject || "");
      setCategory(initialCategory || "Refund");
      setMessage(initialMessage || "");
      setOrderId(initialOrderId || "");
    }
  }, [initialTicket, initialSubject, initialCategory, initialMessage, initialOrderId, isOpen]);

  const fetchTicketDetails = async (ticketId: string) => {
    setIsLoadingDetails(true);
    try {
      const res: any = await api.get(`/tickets/me/${ticketId}`);
      const data = res.data?.data || res.data;
      if (data) {
        setActiveTicket(data);
      }
    } catch (err) {
      console.warn("Failed to fetch ticket details:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (!isOpen) return null;

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setErrorMsg("Order ID / Reference is required.");
      return;
    }
    if (!subject.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res: any = await api.post("/tickets", {
        subject: subject.trim(),
        category,
        orderId: orderId.trim(),
        description: message.trim(),
        message: message.trim(),
      });
      const created = res.data?.data || res.data;

      if (onTicketCreated) onTicketCreated();

      if (created?.id) {
        setActiveTicket(created);
        setIsNewQueryView(false);
        fetchTicketDetails(created.id);
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to create support query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket?.id || isSendingReply) return;

    setIsSendingReply(true);
    try {
      await api.post(`/tickets/me/${activeTicket.id}/messages`, {
        message: replyText.trim(),
      });
      setReplyText("");
      await fetchTicketDetails(activeTicket.id);
      if (onTicketCreated) onTicketCreated();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send message");
    } finally {
      setIsSendingReply(false);
    }
  };

  const replies = activeTicket?.replies || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-ink/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/10 p-5 bg-white/60">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-neon/30 text-neon-dark">
              <Headset size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink">
                {isNewQueryView ? "Customer Support Query" : activeTicket?.subject || "Support Inquiry"}
              </h3>
              <p className="text-xs text-ink-soft">
                {isNewQueryView
                  ? "Reach out to Voltra Support team for assistance"
                  : `Query #${activeTicket?.id?.slice(0, 8)?.toUpperCase()} • Status: ${activeTicket?.status || "OPEN"}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink hover:bg-ink/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {isNewQueryView ? (
          /* ── CREATE NEW QUERY FORM ── */
          <form onSubmit={handleCreateTicket} className="p-6 space-y-4 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-600">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1">
                  Query Category <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  options={CATEGORIES}
                  value={category}
                  onChange={setCategory}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1">
                  Order ID / Reference <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. VLTR-888852-275"
                  className="w-full rounded-xl border border-ink/10 bg-white p-2.5 text-xs text-ink placeholder:text-ink-muted outline-none focus:border-neon focus:ring-2 focus:ring-neon/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-soft mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your query..."
                className="w-full rounded-xl border border-ink/10 bg-white p-2.5 text-xs text-ink placeholder:text-ink-muted outline-none focus:border-neon focus:ring-2 focus:ring-neon/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-soft mb-1">
                Detailed Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide detailed information regarding your request..."
                className="w-full rounded-2xl border border-ink/10 bg-white p-3 text-xs text-ink placeholder:text-ink-muted outline-none focus:border-neon focus:ring-2 focus:ring-neon/20 transition resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold text-ink-soft hover:bg-ink/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-neon px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Submitting Query...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Submit Query
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ── LIVE CHAT & CONVERSATION VIEW ── */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top Bar Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 bg-slate-50 border-b border-ink/5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink">Category: {activeTicket?.category}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                    activeTicket?.status === "CLOSED"
                      ? "bg-slate-200 text-slate-700"
                      : activeTicket?.status === "IN_PROGRESS"
                      ? "bg-blue-500/15 text-blue-700"
                      : "bg-neon/30 text-neon-dark"
                  }`}
                >
                  {activeTicket?.status || "OPEN"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsNewQueryView(true)}
                className="text-xs font-bold text-neon-dark hover:underline flex items-center gap-1"
              >
                <Plus size={13} /> New Ticket
              </button>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50/50">
              {isLoadingDetails ? (
                <div className="py-12 text-center text-ink-soft font-semibold text-xs">
                  <Loader2 size={20} className="mx-auto animate-spin text-neon-dark mb-2" />
                  Loading conversation history...
                </div>
              ) : replies.length === 0 ? (
                <div className="py-8 text-center text-ink-soft text-xs">
                  No messages yet. Write a message below to start chatting with support.
                </div>
              ) : (
                replies.map((msg: any) => {
                  const isStaff = msg.isStaffReply;
                  const senderName = isStaff ? "Voltra Support Agent" : "You";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? "items-start" : "items-end"}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-ink-muted mb-1 px-1">
                        {isStaff ? <ShieldCheck size={12} className="text-neon-dark" /> : <User size={12} />}
                        <span className="font-bold">{senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                          isStaff
                            ? "bg-white border border-ink/10 text-ink rounded-tl-none"
                            : "bg-ink text-white rounded-tr-none"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input Bar / Locked Closed State */}
            {activeTicket?.status === "CLOSED" ? (
              <div className="p-4 bg-slate-100 border-t border-ink/10 text-center text-xs font-bold text-ink-muted flex items-center justify-center gap-2 select-none">
                <Lock size={15} className="text-ink-muted shrink-0" />
                This support ticket is closed. Typing and replies are disabled.
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-ink/10 flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your message to support..."
                  className="flex-1 rounded-2xl border border-ink/10 bg-slate-50 px-4 py-2.5 text-xs text-ink placeholder:text-ink-muted outline-none focus:border-neon focus:ring-2 focus:ring-neon/20 transition"
                />
                <button
                  type="submit"
                  disabled={isSendingReply || !replyText.trim()}
                  className="btn-neon px-5 py-2.5 text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isSendingReply ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
