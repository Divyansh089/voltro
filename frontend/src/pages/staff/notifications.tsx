import React, { useState } from "react";
import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";
import {
  Bell,
  Plus,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Package,
  Headset,
  Zap,
  Filter,
} from "lucide-react";
import { useMyNotifications } from "@/modules/notifications/hooks/useNotifications";
import { CreateNotificationModal } from "@/components/staff/CreateNotificationModal";

export default function StaffNotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    mutate,
  } = useMyNotifications({ limit: 100 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStripeClass = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "border-l-4 border-emerald-500 bg-emerald-50/20";
      case "CANCEL":
        return "border-l-4 border-rose-500 bg-rose-50/20";
      case "MAINTENANCE":
        return "border-l-4 border-amber-500 bg-amber-50/20";
      case "GENERAL":
      default:
        return "border-l-4 border-sky-500 bg-sky-50/20";
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "LOW_STOCK") return n.data?.kind === "LOW_STOCK" || n.title.includes("Stock");
    if (filter === "TICKETS") return n.data?.kind === "CS_TICKET_OPENED" || n.title.includes("Ticket");
    if (filter === "PRODUCTS") return n.data?.kind === "STAFF_PRODUCT_ADDED" || n.data?.kind === "STAFF_VARIANT_ADDED";
    return true;
  });

  return (
    <StaffShell>
      <Head>
        <title>Staff Notifications — Voltra Staff</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Staff Notifications</h1>
            <p className="text-xs text-ink-muted mt-1">
              System alerts, low stock warnings, CS ticket dispatches, and broadcast announcements
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="px-4 py-2 rounded-xl bg-white/80 text-xs font-bold text-ink hover:bg-white transition border border-white/80 shadow-sm inline-flex items-center gap-1.5"
              >
                <CheckCheck size={14} /> Mark All Read
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-neon px-4 py-2 text-xs font-extrabold inline-flex items-center gap-2 shadow-md"
            >
              <Plus size={15} /> Create Notification
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-ink flex items-center gap-1.5 pr-2 border-r border-ink/5">
              <Filter size={14} /> Filter:
            </span>
            {[
              { id: "ALL", label: "All Items" },
              { id: "UNREAD", label: `Unread (${unreadCount})` },
              { id: "LOW_STOCK", label: "Low Stock Alerts" },
              { id: "TICKETS", label: "CS Tickets" },
              { id: "PRODUCTS", label: "Product Additions" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  filter === f.id
                    ? "bg-ink text-white shadow-sm"
                    : "bg-white/60 text-ink-soft hover:bg-white hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-ink-muted font-medium">
            Showing {filteredNotifications.length} of {notifications.length}
          </span>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="glass p-12 text-center text-xs text-ink-muted">
              Loading staff notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="glass p-12 text-center space-y-2">
              <Bell size={24} className="mx-auto text-ink-muted" />
              <p className="text-xs font-bold text-ink">No notifications matching selected filter.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isExpanded = expandedId === n.id;
              const getStripeBg = (type: string) => {
                switch (type) {
                  case "SUCCESS": return "bg-emerald-500";
                  case "CANCEL": return "bg-rose-500";
                  case "MAINTENANCE": return "bg-amber-500";
                  case "GENERAL": default: return "bg-sky-500";
                }
              };
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markAsRead(n.id);
                    setExpandedId(isExpanded ? null : n.id);
                  }}
                  className={`flex items-stretch overflow-hidden rounded-xl border border-ink/10 bg-white transition cursor-pointer hover:bg-slate-50 ${
                    !n.isRead ? "shadow-sm ring-1 ring-ink/10" : "opacity-80"
                  }`}
                >
                  {/* Dedicated Narrow Left Color Stripe Only */}
                  <div className={`w-1.5 shrink-0 ${getStripeBg(n.type)}`} />

                  <div className="flex-1 p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-base font-bold text-ink">{n.title}</span>
                        {!n.isRead && (
                          <span className="bg-neon text-ink text-[9px] font-extrabold px-2.5 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}
                        <span className="text-[10px] font-extrabold uppercase bg-white/80 text-ink-muted px-2 py-0.5 rounded-full border border-ink/5">
                          {n.type}
                        </span>
                      </div>

                      <p
                        className={`text-xs text-ink-soft leading-relaxed ${
                          isExpanded ? "" : "line-clamp-2"
                        }`}
                      >
                        {n.message}
                      </p>

                      {/* Metadata Badge Attributes */}
                      {n.data && isExpanded && (
                        <div className="mt-3 pt-3 border-t border-ink/5 flex flex-wrap gap-2 text-xs font-mono">
                          {n.data.staffId && (
                            <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                              Staff ID: {n.data.staffId}
                            </span>
                          )}
                          {n.data.customerId && (
                            <span className="bg-indigo-900 text-white px-2.5 py-1 rounded-lg">
                              Customer ID: {n.data.customerId}
                            </span>
                          )}
                          {n.data.productId && (
                            <span className="bg-white/90 text-ink px-2.5 py-1 rounded-lg border border-ink/10">
                              Product ID: {n.data.productId}
                            </span>
                          )}
                          {n.data.variantId && (
                            <span className="bg-white/90 text-ink px-2.5 py-1 rounded-lg border border-ink/10">
                              Variant ID: {n.data.variantId}
                            </span>
                          )}
                          {n.data.ticketId && (
                            <span className="bg-white/90 text-ink px-2.5 py-1 rounded-lg border border-ink/10">
                              Ticket ID: {n.data.ticketId}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-ink-muted font-medium">
                        {new Date(n.createdAt).toLocaleDateString()}{" "}
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="p-1.5 text-ink-muted hover:text-rose-500 transition rounded-lg hover:bg-white/80"
                        title="Delete notification"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      <CreateNotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
      />
    </StaffShell>
  );
}
