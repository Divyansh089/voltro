import { useQuery } from "@tanstack/react-query";
import { getSupportDashboard } from "../api/getDashboard";

export function useSupportDashboard() {
  return useQuery({
    queryKey: ["analytics", "support-dashboard"],
    queryFn: getSupportDashboard,
  });
}
