import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useAdminCharts(timeframe: "day" | "month" | "year") {
  return useQuery({
    queryKey: ["admin-charts", timeframe],
    queryFn: async () => {
      const res = await api.get(`/analytics/admin-charts?timeframe=${timeframe}`);
      return res.data?.data;
    },
  });
}
