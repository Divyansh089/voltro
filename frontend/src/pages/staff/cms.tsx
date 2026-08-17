import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useAdminBanners, useAdminCampaigns } from "@/modules/cms/hooks/useAdminCms";
import { usePermission } from "@/hooks/usePermission";
import { Image as ImageIcon, Plus } from "lucide-react";

export default function StaffCMSPage() {
  const { data: bannersRes, isLoading: isLoadingBanners } = useAdminBanners();
  const { data: campaignsRes, isLoading: isLoadingCampaigns } = useAdminCampaigns();
  const canManage = usePermission("cms:manage");

  const banners = bannersRes?.data || [];
  const campaigns = campaignsRes?.data || [];

  return (
    <>
      <Head>
        <title>Content Management — Voltra Staff</title>
      </Head>
      <StaffShell>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Content Management</h1>
            <p className="text-sm text-ink-soft">Manage homepage banners and promotional campaigns.</p>
          </div>

          {/* Banners Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Homepage Banners</h2>
              {canManage && (
                <button className="flex items-center gap-2 rounded-xl bg-neon px-4 py-2 text-xs font-bold uppercase tracking-wider text-neon-dark hover:bg-[#aee600]">
                  <Plus size={14} /> Add Banner
                </button>
              )}
            </div>

            <div className="glass overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-ink">
                  <thead className="border-b border-ink/5 bg-ink/5 text-xs uppercase text-ink-soft">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Preview</th>
                      <th className="px-6 py-4 font-semibold">Details</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Active Dates</th>
                      <th className="px-6 py-4 font-semibold text-right">Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5 bg-white/40">
                    {isLoadingBanners ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-ink-muted">
                          Loading banners...
                        </td>
                      </tr>
                    ) : !banners.length ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-ink-muted">
                          No banners configured.
                        </td>
                      </tr>
                    ) : (
                      banners.map((banner) => (
                        <tr key={banner.id} className="transition-colors hover:bg-white/60">
                          <td className="px-6 py-4">
                            <div className="flex h-12 w-24 items-center justify-center overflow-hidden rounded-lg bg-ink/5 object-cover">
                              {banner.imageUrl ? (
                                <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                              ) : (
                                <ImageIcon className="text-ink-muted" size={20} />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{banner.title}</div>
                            {banner.subtitle && <div className="text-xs text-ink-muted">{banner.subtitle}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                banner.isActive ? "bg-neon/20 text-neon-dark" : "bg-ink/10 text-ink-soft"
                              }`}
                            >
                              {banner.isActive ? "Active" : "Draft"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {banner.startsAt || banner.endsAt ? (
                              <div className="text-xs text-ink-soft">
                                {banner.startsAt ? new Date(banner.startsAt).toLocaleDateString() : 'Now'} - 
                                {banner.endsAt ? new Date(banner.endsAt).toLocaleDateString() : 'Forever'}
                              </div>
                            ) : (
                              <span className="text-xs text-ink-muted">Always Active</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-medium">{banner.sortOrder}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Campaigns Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Promotional Campaigns</h2>
              {canManage && (
                <button className="flex items-center gap-2 rounded-xl bg-neon px-4 py-2 text-xs font-bold uppercase tracking-wider text-neon-dark hover:bg-[#aee600]">
                  <Plus size={14} /> Add Campaign
                </button>
              )}
            </div>

            <div className="glass overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-ink">
                  <thead className="border-b border-ink/5 bg-ink/5 text-xs uppercase text-ink-soft">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Campaign</th>
                      <th className="px-6 py-4 font-semibold">Discount</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5 bg-white/40">
                    {isLoadingCampaigns ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-ink-muted">
                          Loading campaigns...
                        </td>
                      </tr>
                    ) : !campaigns.length ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-ink-muted">
                          No campaigns configured.
                        </td>
                      </tr>
                    ) : (
                      campaigns.map((campaign) => (
                        <tr key={campaign.id} className="transition-colors hover:bg-white/60">
                          <td className="px-6 py-4">
                            <div className="font-medium">{campaign.name}</div>
                            {campaign.description && <div className="text-xs text-ink-muted truncate max-w-[250px]">{campaign.description}</div>}
                          </td>
                          <td className="px-6 py-4">
                            {campaign.discountPercentage ? (
                              <span className="font-bold text-neon-dark">{Number(campaign.discountPercentage).toFixed(0)}% OFF</span>
                            ) : (
                              <span className="text-xs text-ink-muted">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                campaign.isActive ? "bg-neon/20 text-neon-dark" : "bg-ink/10 text-ink-soft"
                              }`}
                            >
                              {campaign.isActive ? "Active" : "Draft"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {campaign.startsAt || campaign.endsAt ? (
                              <div className="text-xs text-ink-soft">
                                {campaign.startsAt ? new Date(campaign.startsAt).toLocaleDateString() : 'Now'} - 
                                {campaign.endsAt ? new Date(campaign.endsAt).toLocaleDateString() : 'Forever'}
                              </div>
                            ) : (
                              <span className="text-xs text-ink-muted">Always Active</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </StaffShell>
    </>
  );
}
