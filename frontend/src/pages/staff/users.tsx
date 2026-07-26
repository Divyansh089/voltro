import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";

export default function StaffUsersPage() {
  return (
    <>
      <Head>
        <title>Users — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">User Management</h1>
            <p className="text-sm text-ink-soft">Manage user accounts and roles.</p>
          </div>
          <div className="glass p-5">
            <p className="text-sm text-ink-muted">
              User management table will load here from the API...
            </p>
          </div>
        </div>
      </StaffShell>
    </>
  );
}
