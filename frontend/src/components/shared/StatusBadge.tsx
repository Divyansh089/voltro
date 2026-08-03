const STATUS_STYLES: Record<string, string> = {
  // Order statuses
  PENDING: "bg-amber-400/20 text-amber-700",
  PROCESSING: "bg-sky-500/15 text-sky-700",
  SHIPPED: "bg-indigo-500/15 text-indigo-700",
  DELIVERED: "bg-emerald-500/15 text-emerald-700",
  CANCELLED: "bg-rose-500/15 text-rose-700",
  RETURNED: "bg-rose-500/15 text-rose-700",
  // Ticket statuses
  OPEN: "bg-amber-400/20 text-amber-700",
  IN_PROGRESS: "bg-sky-500/15 text-sky-700",
  RESOLVED: "bg-emerald-500/15 text-emerald-700",
  CLOSED: "bg-ink/10 text-ink-muted",
  // Inventory
  IN_STOCK: "bg-emerald-500/15 text-emerald-700",
  LOW_STOCK: "bg-amber-400/20 text-amber-700",
  OUT_OF_STOCK: "bg-rose-500/15 text-rose-700",
  // General
  ACTIVE: "bg-emerald-500/15 text-emerald-700",
  INACTIVE: "bg-ink/10 text-ink-muted",
  DRAFT: "bg-ink/10 text-ink-muted",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toUpperCase()] ?? "bg-ink/5 text-ink-soft";
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {label.toLowerCase()}
    </span>
  );
}
