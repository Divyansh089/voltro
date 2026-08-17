import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  basePrice: number | string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  _count?: {
    variants: number;
  };
}

export interface ProductsResponse {
  data: Product[];
  message: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["admin", "products", params],
    queryFn: async () => {
      const { data } = await api.get<ProductsResponse>("/products", {
        params,
      });
      return data;
    },
  });
}

export function useProductDetail(idOrSlug: string | null) {
  return useQuery({
    queryKey: ["product", idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return null;
      const res = await api.get(`/products/${idOrSlug}`);
      return res.data?.data;
    },
    enabled: !!idOrSlug,
  });
}
