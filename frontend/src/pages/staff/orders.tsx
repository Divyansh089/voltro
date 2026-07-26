import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";

export default function StaffOrdersPage() {
  return (
    <>
      <Head>
        <title>Orders — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Order Fulfillment</h1>
            <p className="text-sm text-ink-soft">View and manage customer orders.</p>
          </div>
          <div className="glass p-5">
            <p className="text-sm text-ink-muted">Order table will load here from the API...</p>
          </div>
        </div>
      </StaffShell>
    </>
  );
}
