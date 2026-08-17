import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { InventoryItem } from "./useInventory";

interface AdjustInventoryParams {
  variantId: string;
  adjustment: number;
  reason: string;
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ variantId, adjustment, reason }: AdjustInventoryParams) => {
      const { data } = await api.post<{ data: InventoryItem; message: string }>(
        `/inventory/${variantId}/adjust`,
        { adjustment, reason }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
  });
}
