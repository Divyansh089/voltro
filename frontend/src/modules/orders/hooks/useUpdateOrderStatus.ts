import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Order } from "./useAdminOrders";

interface UpdateOrderStatusParams {
  id: string;
  status: Order["status"];
  cancellationReason?: string;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, cancellationReason }: UpdateOrderStatusParams) => {
      const { data } = await api.patch<{ data: Order; message: string }>(`/orders/${id}/status`, {
        status,
        cancellationReason,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
