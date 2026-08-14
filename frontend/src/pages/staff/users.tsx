import Head from "next/head";
import { useState } from "react";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useUsers } from "@/modules/users/hooks/useUsers";
import { useAuth } from "@/providers/AuthProvider";
import { ROLES } from "@/constants";
import { Search, UserPlus, Copy, Check } from "lucide-react";
import { AddStaffModal } from "@/components/staff/AddStaffModal";
import { StaffCredentialsModal } from "@/components/staff/StaffCredentialsModal";
import { useQueryClient } from "@tanstack/react-query";

export default function StaffUsersPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUserId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    generatedPassword: string;
    name: string;
  } | null>(null);

  const { data, isLoading } = useUsers({ page, limit: 20, search });

  const handleStaffSuccess = (credentials: { email: string; generatedPassword: string; name: string }) => {
    setIsAddStaffOpen(false);
    setCreatedCredentials(credentials);
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

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
              <h1 className="font-display text-2xl font-bold text-ink">User Management</h1>
              <p className="text-sm text-ink-soft">Manage customers and staff account profiles.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64 sm:w-80">
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

              {/* Add Staff Action Button */}
              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="btn-neon inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold whitespace-nowrap shadow-sm hover:scale-[1.01]"
              >
                + Add Staff
              </button>
            </div>
          </div>

          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-ink/5 bg-ink/5 text-xs uppercase text-ink-soft font-semibold">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">User ID</th>
                    <th className="px-6 py-4 font-semibold">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 bg-white/40">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-ink-muted">
                        Loading users...
                      </td>
                    </tr>
                  ) : !data?.data?.length ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-ink-muted">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    data.data.map((u: any) => {
                      const name = u.staffProfile 
                        ? `${u.staffProfile.firstName || ""} ${u.staffProfile.lastName || ""}`.trim()
                        : u.customerProfile
                        ? `${u.customerProfile.firstName || ""} ${u.customerProfile.lastName || ""}`.trim()
                        : "Unknown";

                      return (
                        <tr key={u.id} className="transition-colors hover:bg-white/60">
                          <td className="px-6 py-4">
                            <div className="font-medium text-ink">{name}</div>
                            <div className="text-xs text-ink-muted">{u.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
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
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                                u.isEmailVerified ? "bg-neon/20 text-neon-dark" : "bg-amber-500/20 text-amber-700"
                              }`}
                            >
                              {u.isEmailVerified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 font-mono text-xs text-ink-soft">
                              <span className="truncate max-w-[130px]" title={u.id}>
                                {u.id}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyUserId(u.id)}
                                className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-ink/10 transition"
                                title="Copy User ID"
                              >
                                {copiedId === u.id ? (
                                  <Check size={14} className="text-emerald-600" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-ink-soft">
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

        {/* Add Staff Modal */}
        <AddStaffModal
          isOpen={isAddStaffOpen}
          onClose={() => setIsAddStaffOpen(false)}
          onSuccess={handleStaffSuccess}
        />

        {/* One-Time Credentials Display Modal */}
        <StaffCredentialsModal
          isOpen={!!createdCredentials}
          onClose={() => setCreatedCredentials(null)}
          credentials={createdCredentials}
        />
      </StaffShell>
    </>
  );
}
