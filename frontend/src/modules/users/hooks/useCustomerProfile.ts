import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

export interface CustomerProfileData {
  id: string;
  email: string;
  isActive: boolean;
  isEmailVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
  role: { id: string; name: string } | string;
  customerProfile: {
    id?: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    dateOfBirth?: string | null;
  } | null;
  staffProfile: {
    id?: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  } | null;
}

export function useCustomerProfile() {
  const { user } = useAuth();

  return useQuery<CustomerProfileData>({
    queryKey: ["customer-profile-me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      const raw = res.data?.data;
      return raw?.user || raw;
    },
    enabled: !!user,
  });
}
