import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface NotificationItem {
  id: string;
  userId: string;
  type: "SUCCESS" | "CANCEL" | "GENERAL" | "MAINTENANCE";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export function useMyNotifications(options?: { isRead?: boolean; page?: number; limit?: number }) {
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams();
  if (options?.isRead !== undefined) queryParams.set("isRead", String(options.isRead));
  if (options?.page) queryParams.set("page", String(options.page));
  queryParams.set("limit", String(options?.limit || 50));
  queryParams.set("sortBy", "createdAt");
  queryParams.set("sortOrder", "desc");

  const queryKey = ["my-notifications", options?.isRead, options?.page, options?.limit];

  const { data, isLoading, error, refetch } = useQuery<{ data: NotificationItem[]; meta?: any }>({
    queryKey,
    queryFn: async () => {
      const res = await api.get(`/notifications/me?${queryParams.toString()}`);
      return res.data;
    },
    refetchInterval: 3000,
  });

  const notifications: NotificationItem[] = data?.data || [];
  const pagination = data?.meta;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (idOrIds: string | string[]) => {
      const notificationIds = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      await api.post("/notifications/me/read", { notificationIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.post("/notifications/me/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/me/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
    },
  });

  return {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    isError: error,
    mutate: refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
  };
}

export function useCreateCustomNotification() {
  const createNotification = async (payload: {
    targetType: "ALL" | "USER" | "ROLE";
    targetId?: string;
    type: "SUCCESS" | "CANCEL" | "GENERAL" | "MAINTENANCE";
    title: string;
    message: string;
    metadata?: any;
  }) => {
    const res = await api.post("/notifications/custom", payload);
    return res.data;
  };

  return { createNotification };
}
