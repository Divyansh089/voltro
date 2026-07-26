import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";

export default function StaffCmsPage() {
  return (
    <>
      <Head>
        <title>CMS — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Content Management</h1>
            <p className="text-sm text-ink-soft">Manage banners, campaigns, and promotions.</p>
          </div>
          <div className="glass p-5">
            <p className="text-sm text-ink-muted">CMS editor will load here from the API...</p>
          </div>
        </div>
      </StaffShell>
    </>
  );
}
