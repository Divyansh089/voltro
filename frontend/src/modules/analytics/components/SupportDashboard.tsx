import { useSupportDashboard } from "../hooks/useSupportDashboard";
import { KpiCard } from "@/components/shared/KpiCard";
import { useAuth } from "@/providers/AuthProvider";

export function SupportDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useSupportDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass animate-pulse p-5 h-24" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="glass p-5">
        <p className="text-sm text-rose-600">Failed to load support dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-sm text-ink-soft">
          Customer support queue and SLA tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard label="My Open Tickets" value={data.overview.myOpenTickets} />
        <KpiCard label="Unassigned Tickets" value={data.overview.unassignedTickets} />
        <KpiCard label="Total Open Tickets" value={data.overview.totalOpenTickets} />
        <KpiCard 
          label="SLA Breaches" 
          value={data.overview.slaBreaches} 
          deltaColor={data.overview.slaBreaches > 0 ? "text-amber-600" : "text-emerald-600"}
          delta={data.overview.slaBreaches > 0 ? "> 24h unresolved" : "All clear"}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="glass p-5 col-span-full">
          <h3 className="font-display text-lg font-semibold text-ink">Recent Open Tickets</h3>
          <div className="mt-4 space-y-2">
            {data.recentTickets.length === 0 ? (
              <p className="text-sm text-ink-muted">No open tickets at the moment.</p>
            ) : (
              data.recentTickets.map((t) => (
                <div key={t.id} className="glass-soft flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm font-medium text-ink">{t.subject}</div>
                    <div className="text-xs text-ink-soft">From: {t.customerEmail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ink">
                      {t.assignedTo === user?.email ? "Assigned to me" : `Assigned to: ${t.assignedTo}`}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-neon">
                      {t.status.replace("_", " ")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
