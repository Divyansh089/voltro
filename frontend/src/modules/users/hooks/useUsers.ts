import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface User {
  id: string;
  email: string;
  roleId: string;
  isEmailVerified: boolean;
  createdAt: string;
  customerProfile?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  staffProfile?: {
    firstName: string;
    lastName: string;
    department?: string;
  };
  role?: {
    name: string;
  };
}

export interface UsersResponse {
  data: User[];
  message: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const { data } = await api.get<UsersResponse>("/users", { params });
      return data;
    },
  });
}
