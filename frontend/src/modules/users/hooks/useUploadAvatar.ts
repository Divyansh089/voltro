import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { STORAGE_KEYS } from "@/constants";
import { useAuth } from "@/providers/AuthProvider";

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/users/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data?.data;
    },
    onSuccess: async (data) => {
      if (typeof window !== "undefined" && data?.avatarUrl) {
        try {
          const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            parsed.avatarUrl = data.avatarUrl;
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
          }
        } catch (e) {
          console.error("Failed to update stored user avatar", e);
        }
      }
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["customer-profile-me"] });
    },
  });
}
