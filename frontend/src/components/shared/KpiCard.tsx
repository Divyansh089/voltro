export function KpiCard({
  label,
  value,
  delta,
  deltaColor = "text-emerald-600",
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaColor?: string;
}) {
  return (
    <div className="glass p-5">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold text-ink">{value}</div>
      {delta && <div className={`mt-1 text-xs ${deltaColor}`}>{delta}</div>}
    </div>
  );
}
