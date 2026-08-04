import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface InventoryItem {
  id: string;
  variantId: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  updatedAt: string;
  variant?: {
    id: string;
    sku: string;
    name: string;
    price: number;
    product?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface InventoryResponse {
  data: InventoryItem[];
  message: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useInventory(params: {
  page?: number;
  limit?: number;
  productId?: string;
  variantId?: string;
  lowStockOnly?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["admin", "inventory", params],
    queryFn: async () => {
      const { data } = await api.get<InventoryResponse>("/inventory", {
        params,
      });
      return data;
    },
  });
}
