import axios from "axios";
import { API_BASE_URL } from "@/constants";
import { StorageService } from "./storage.service";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT ──
api.interceptors.request.use((config) => {
  const token = StorageService.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      StorageService.clearAuth();
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path.startsWith("/staff") || path.startsWith("/customer")) {
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
