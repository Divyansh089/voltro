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
      const { accessToken, user } = res.data;
      const profile = user.staffProfile || user.customerProfile;
      login(
        accessToken,
        {
          id: user.id,
          email: user.email,
          role: user.role as RoleName,
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          staffProfile: user.staffProfile ? { phone: user.staffProfile.phone } : undefined,
        },
        user.permissions,
      );
      router.push(getDefaultRouteForRole(user.role as RoleName));
    },
  });
}
