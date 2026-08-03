import api from "@/services/axios";
import type { RegisterRequest, AuthResponse } from "../types/auth.types";

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", data);
  return res.data;
}
