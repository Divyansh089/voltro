import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Ticket } from "./useAdminTickets";

interface UpdateTicketParams {
  id: string;
  status?: Ticket["status"];
  priority?: Ticket["priority"];
  assignedToId?: string;
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTicketParams) => {
      const response = await api.patch<{ data: Ticket; message: string }>(
        `/tickets/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
  });
}
