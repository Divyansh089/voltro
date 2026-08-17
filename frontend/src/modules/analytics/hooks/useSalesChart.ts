import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface SalesChartDataPoint {
  date: string;
  revenue: number;
}

export function useSalesChart(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["analytics", "sales-chart", params],
    queryFn: async () => {
      const { data } = await api.get<{ data: SalesChartDataPoint[]; message: string }>(
        "/analytics/sales-chart",
        { params }
      );
      return data;
    },
  });
}
