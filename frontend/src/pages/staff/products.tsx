import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";
import { usePermission } from "@/hooks/usePermission";

export default function StaffProductsPage() {
  const canCreate = usePermission("product:create");

  return (
    <>
      <Head>
        <title>Products — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Product Catalog</h1>
              <p className="text-sm text-ink-soft">Manage your product listings and variants.</p>
            </div>
            {canCreate && (
              <button className="btn-neon inline-flex items-center gap-2 py-2.5 px-5 text-sm">
                + Add Product
              </button>
            )}
          </div>
          <div className="glass p-5">
            <p className="text-sm text-ink-muted">Product table will load here from the API...</p>
          </div>
        </div>
      </StaffShell>
    </>
  );
}
