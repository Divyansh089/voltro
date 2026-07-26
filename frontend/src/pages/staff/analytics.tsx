import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useAuth } from "@/providers/AuthProvider";
import { ROLES } from "@/constants";

export default function StaffAnalyticsPage() {
  const { user } = useAuth();

  // Only ADMIN can access this page
  if (user?.role !== ROLES.ADMIN) {
    return (
      <>
        <Head>
          <title>Analytics — Voltra Staff</title>
        </Head>
        <StaffShell>
          <div className="glass p-8 text-center">
            <h2 className="font-display text-xl font-bold text-ink">Access Restricted</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Financial analytics are restricted to administrators.
            </p>
          </div>
        </StaffShell>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Financial Analytics — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Financial Analytics</h1>
            <p className="text-sm text-ink-soft">Revenue, users, and platform-wide metrics.</p>
          </div>
          <div className="glass p-5">
            <p className="text-sm text-ink-muted">
              Admin financial dashboard will load here from the API...
            </p>
          </div>
        </div>
      </StaffShell>
    </>
  );
}
