import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";

export default function StaffInventoryPage() {
  return (
    <>
      <Head>
        <title>Inventory — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Inventory Management</h1>
            <p className="text-sm text-ink-soft">Monitor stock levels and adjust quantities.</p>
          </div>
          <div className="glass p-5">
            <p className="text-sm text-ink-muted">Inventory table will load here from the API...</p>
          </div>
        </div>
      </StaffShell>
    </>
  );
}
