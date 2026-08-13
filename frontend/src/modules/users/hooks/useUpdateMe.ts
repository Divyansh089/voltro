import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface UpdateMeData {
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMeData) => {
      const res = await api.patch("/users/me", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      queryClient.invalidateQueries({ queryKey: ["customer-profile-me"] });
      queryClient.invalidateQueries({ queryKey: ["staff-profile-me"] });
    },
  });
}
