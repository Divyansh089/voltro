import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  brand?: string;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      const data = res.data?.data;
      return Array.isArray(data) ? data : data?.categories ?? [];
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const res = await api.post("/products", input);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useUploadProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      file,
      altText,
      isPrimary = false,
    }: {
      productId: string;
      file: File;
      altText?: string;
      isPrimary?: boolean;
    }) => {
      const formData = new FormData();
      formData.append("image", file);
      if (altText) formData.append("altText", altText);
      formData.append("isPrimary", String(isPrimary));

      const res = await api.post(`/products/${productId}/images`, formData);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
