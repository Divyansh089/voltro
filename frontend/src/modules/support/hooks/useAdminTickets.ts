import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_ON_CUSTOMER" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: "GENERAL" | "ORDER_ISSUE" | "RETURNS" | "TECHNICAL";
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    customerProfile?: {
      firstName: string;
      lastName: string;
    };
  };
  assignedTo?: {
    email: string;
    staffProfile?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface AdminTicketsResponse {
  data: Ticket[];
  message: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useAdminTickets(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  assignedToId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["admin", "tickets", params],
    queryFn: async () => {
      const { data } = await api.get<AdminTicketsResponse>("/tickets", {
        params,
      });
      return data;
    },
  });
}
