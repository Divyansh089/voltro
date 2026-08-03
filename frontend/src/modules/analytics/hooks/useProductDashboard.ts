import { useQuery } from "@tanstack/react-query";
import { getProductDashboard } from "../api/getDashboard";

export function useProductDashboard() {
  return useQuery({
    queryKey: ["analytics", "products-dashboard"],
    queryFn: getProductDashboard,
  });
}
