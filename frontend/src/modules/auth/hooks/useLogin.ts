import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { loginUser } from "../api/login";
import { useAuth } from "@/providers/AuthProvider";
import { getDefaultRouteForRole } from "@/lib/routes";
import type { RoleName } from "@/constants";
import type { LoginRequest } from "../types/auth.types";

export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginUser(data),
    onSuccess: (res) => {
      const { token, user } = res.data;
      login(
        token,
        {
          id: user.id,
          email: user.email,
          role: user.role as RoleName,
          firstName: user.customerProfile?.firstName,
          lastName: user.customerProfile?.lastName,
        },
        user.permissions,
      );
      router.push(getDefaultRouteForRole(user.role as RoleName));
    },
  });
}
