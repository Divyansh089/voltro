import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useProductCharts(timeframe: "day" | "month" | "year") {
  return useQuery({
    queryKey: ["product-charts", timeframe],
    queryFn: async () => {
      const res = await api.get(`/analytics/product-charts?timeframe=${timeframe}`);
      return res.data?.data;
    },
  });
}
