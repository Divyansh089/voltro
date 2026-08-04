import Head from "next/head";
import { useState } from "react";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useUsers } from "@/modules/users/hooks/useUsers";
import { useAuth } from "@/providers/AuthProvider";
import { ROLES } from "@/constants";
import { Search } from "lucide-react";

export default function StaffUsersPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  
  const { data, isLoading } = useUsers({ page, limit: 20, search });

  // Restrict to admins and support (if appropriate)
  if (user?.role === ROLES.PRODUCT_MANAGER) {
    return (
      <StaffShell>
        <div className="glass p-8 text-center">
          <h2 className="font-display text-xl font-bold text-ink">Access Restricted</h2>
          <p className="mt-2 text-sm text-ink-soft">
            User management is restricted.
          </p>
        </div>
      </StaffShell>
    );
  }

  return (
    <>
      <Head>
        <title>Users — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Users</h1>
              <p className="text-sm text-ink-soft">Manage customers and staff accounts.</p>
            </div>
            
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full rounded-xl border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-all focus:border-neon focus:ring-1 focus:ring-neon"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-ink/5 bg-ink/5 text-xs uppercase text-ink-soft">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 bg-white/40">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-ink-muted">
                        Loading users...
                      </td>
                    </tr>
                  ) : !data?.data?.length ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-ink-muted">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    data.data.map((u: any) => {
                      const name = u.staffProfile 
                        ? `${u.staffProfile.firstName} ${u.staffProfile.lastName}`
                        : u.customerProfile
                        ? `${u.customerProfile.firstName} ${u.customerProfile.lastName}`
                        : "Unknown";

                      return (
                        <tr key={u.id} className="transition-colors hover:bg-white/60">
                          <td className="px-6 py-4">
                            <div className="font-medium">{name}</div>
                            <div className="text-xs text-ink-muted">{u.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                u.role?.name === "ADMIN" 
                                  ? "bg-purple-500/20 text-purple-700" 
                                  : u.role?.name === "CUSTOMER"
                                  ? "bg-ink/10 text-ink-soft"
                                  : "bg-blue-500/20 text-blue-700"
                              }`}
                            >
                              {u.role?.name || "CUSTOMER"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                u.isEmailVerified ? "bg-neon/20 text-neon-dark" : "bg-amber-500/20 text-amber-700"
                              }`}
                            >
                              {u.isEmailVerified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-ink/5 bg-white/40 px-6 py-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-ink/10 px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-white disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs text-ink-muted">
                  Page {page} of {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                  className="rounded-lg border border-ink/10 px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </StaffShell>
    </>
  );
}
