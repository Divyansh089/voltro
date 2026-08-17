import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  productId: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  bannerImageUrl: string | null;
  discountPercentage: number | string | null;
  couponId: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export function useAdminBanners() {
  return useQuery({
    queryKey: ["admin", "cms", "banners"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Banner[]; message: string }>("/cms/admin/banners");
      return data;
    },
  });
}

export function useAdminCampaigns() {
  return useQuery({
    queryKey: ["admin", "cms", "campaigns"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Campaign[]; message: string }>("/cms/admin/campaigns");
      return data;
    },
  });
}
