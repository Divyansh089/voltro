import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";

export default function StaffSupportPage() {
  return (
    <>
      <Head>
        <title>Support Queue — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Support Queue</h1>
            <p className="text-sm text-ink-soft">Manage and reply to customer support tickets.</p>
          </div>
          <div className="glass p-5">
            <p className="text-sm text-ink-muted">Ticket queue will load here from the API...</p>
          </div>
        </div>
      </StaffShell>
    </>
  );
}
