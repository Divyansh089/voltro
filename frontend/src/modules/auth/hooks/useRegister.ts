import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { registerUser } from "../api/register";
import { useAuth } from "@/providers/AuthProvider";
import { ROUTES } from "@/lib/routes";
import type { RegisterRequest } from "../types/auth.types";

export function useRegister() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerUser(data),
    onSuccess: (res) => {
      const { accessToken, user } = res.data;
      login(
        accessToken,
        {
          id: user.id,
          email: user.email,
          role: "CUSTOMER",
          firstName: user.customerProfile?.firstName,
          lastName: user.customerProfile?.lastName,
        },
        user.permissions || [],
      );
      router.push(ROUTES.HOME);
    },
  });
}
