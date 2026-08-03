import api from "@/services/axios";
import type { LoginRequest, AuthResponse } from "../types/auth.types";

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
}
