import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export function useMyAddresses() {
  return useQuery<Address[]>({
    queryKey: ["my-addresses"],
    queryFn: async () => {
      const res = await api.get("/addresses/me");
      return res.data?.data ?? [];
    },
  });
}

export function useSaveAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Address> & { id?: string }) => {
      if (data.id) {
        const res = await api.patch(`/addresses/me/${data.id}`, data);
        return res.data;
      }
      const res = await api.post("/addresses/me", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
    },
  });
}
