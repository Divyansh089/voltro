import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Order {
  id: string;
  userId: string;
  total: number | string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    customerProfile?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface AdminOrdersResponse {
  data: Order[];
  message: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useAdminOrders(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: async () => {
      const { data } = await api.get<AdminOrdersResponse>("/orders", {
        params,
      });
      return data;
    },
  });
}
