import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../api/getDashboard";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["analytics", "admin-dashboard"],
    queryFn: getAdminDashboard,
  });
}
