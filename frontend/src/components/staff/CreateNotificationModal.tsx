import React, { useState } from "react";
import { X, Send, Bell, CheckCircle2, AlertCircle } from "lucide-react";
import { useCreateCustomNotification } from "@/modules/notifications/hooks/useNotifications";

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateNotificationModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateNotificationModalProps) {
  const { createNotification } = useCreateCustomNotification();

  const [targetType, setTargetType] = useState<"ALL" | "USER" | "ROLE">("ALL");
  const [targetId, setTargetId] = useState("");
  const [type, setType] = useState<"SUCCESS" | "CANCEL" | "GENERAL" | "MAINTENANCE">("GENERAL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg("Please fill in both title and message");
      return;
    }
    if (targetType !== "ALL" && !targetId.trim()) {
      setErrorMsg(`Please specify Target ID for ${targetType}`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await createNotification({
        targetType,
        targetId: targetType !== "ALL" ? targetId.trim() : undefined,
        type,
        title: title.trim(),
        message: message.trim(),
      });

      setSuccessMsg("Notification broadcast created successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to create notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-ink/10 bg-white p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-neon/20 text-ink">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Create Broadcast Notification</h2>
              <p className="text-xs text-ink-soft">Send targeted or site-wide announcements</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink-soft hover:bg-ink/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold flex items-center gap-2 border border-rose-200">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink block">Target Audience</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "ALL", label: "All Users" },
                { id: "USER", label: "Specific User ID" },
                { id: "ROLE", label: "Staff Role" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTargetType(t.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    targetType === t.id
                      ? "bg-ink text-white border-ink shadow-sm"
                      : "bg-ink/5 text-ink-soft border-ink/10 hover:border-neon hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {targetType !== "ALL" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink block">
                {targetType === "USER" ? "User ID / Customer ID" : "Role Name (ADMIN, CUSTOMER_SUPPORT, PRODUCT_MANAGER)"}
              </label>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder={targetType === "USER" ? "e.g. c109b821-..." : "e.g. CUSTOMER_SUPPORT"}
                className="w-full rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>
          )}

          {/* Type / Color Stripe Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink block">Category & Stripe Color</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "SUCCESS", label: "Success", class: "border-l-4 border-emerald-500" },
                { id: "CANCEL", label: "Cancelled / Refund", class: "border-l-4 border-rose-500" },
                { id: "GENERAL", label: "General Announcement", class: "border-l-4 border-sky-500" },
                { id: "MAINTENANCE", label: "System Maintenance", class: "border-l-4 border-amber-500" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setType(c.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition border ${c.class} ${
                    type === c.id
                      ? "bg-white text-ink border-neon ring-2 ring-neon/40 shadow-sm"
                      : "bg-white text-ink-soft border-ink/10 hover:border-neon hover:text-ink"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink block">Notification Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled System Maintenance Notice"
              className="w-full rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink block">Message Text</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write announcement details..."
              className="w-full rounded-xl border border-ink/10 bg-white p-3.5 text-xs text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30 leading-relaxed"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-ink/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-ink-soft hover:bg-ink/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-neon px-5 py-2.5 text-xs font-extrabold inline-flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              <Send size={14} /> Send Broadcast
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
