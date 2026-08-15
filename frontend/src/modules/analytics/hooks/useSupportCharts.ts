import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useSupportCharts(timeframe: "day" | "month" | "year") {
  return useQuery({
    queryKey: ["support-charts", timeframe],
    queryFn: async () => {
      const res = await api.get(`/analytics/support-charts?timeframe=${timeframe}`);
      return res.data?.data;
    },
  });
}
