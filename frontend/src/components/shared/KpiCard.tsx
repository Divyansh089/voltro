import React from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaColor?: string;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  subtext?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  deltaColor = "text-emerald-600 font-bold",
  icon: Icon,
  iconBg = "bg-neon/15",
  iconColor = "text-ink",
  subtext,
}: KpiCardProps) {
  return (
    <div className="glass p-5 rounded-3xl border border-ink/5 bg-white/70 shadow-sm hover:shadow-md hover:border-ink/15 transition-all duration-300 relative overflow-hidden group">
      {/* Background glow decoration */}
      <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-neon/10 blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">{label}</span>
        {Icon && (
          <div className={`grid h-10 w-10 place-items-center rounded-2xl ${iconBg} ${iconColor} shadow-inner shrink-0`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-extrabold text-ink tracking-tight">{value}</span>
      </div>

      {(delta || subtext) && (
        <div className="mt-2.5 flex items-center justify-between text-xs border-t border-ink/5 pt-2">
          {delta ? (
            <span className={`font-semibold ${deltaColor}`}>{delta}</span>
          ) : (
            <span className="text-[11px] text-ink-muted">Metric summary</span>
          )}
          {subtext && <span className="text-[11px] text-ink-muted font-medium">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
