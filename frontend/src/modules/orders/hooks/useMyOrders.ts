import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    title: string;
  };
  variant?: {
    id: string;
    title: string;
    sku: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export function useMyOrders() {
  return useQuery<Order[]>({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await api.get("/orders/me");
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.orders)) return data.orders;
      if (data && Array.isArray(data.items)) return data.items;
      return [];
    },
  });
}
