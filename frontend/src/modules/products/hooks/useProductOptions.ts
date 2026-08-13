import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// ── Types ────────────────────────────────────────────────────

export interface ProductOptionValue {
  id: string;
  optionId: string;
  value: string;
  priceDelta: number | string;
}

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  position: number;
  values: ProductOptionValue[];
}

export interface VariantOptionSummary {
  optionName: string;
  value: string;
  priceDelta: number | string;
}

export interface Variant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number | string;
  isDefault: boolean;
  isActive: boolean;
  inventory?: { quantity: number };
  options: VariantOptionSummary[];
}

// ── Product Options ──────────────────────────────────────────

export function useProductOptions(productId: string | null) {
  return useQuery<ProductOption[]>({
    queryKey: ["product-options", productId],
    queryFn: async () => {
      if (!productId) return [];
      const res = await api.get(`/products/${productId}/options`);
      return res.data?.data ?? [];
    },
    enabled: !!productId,
  });
}

export function useCreateOption(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await api.post(`/products/${productId}/options`, data);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-options", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteOption(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (optionId: string) => {
      await api.delete(`/products/${productId}/options/${optionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-options", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useCreateOptionValue(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      optionId,
      value,
      priceDelta,
    }: {
      optionId: string;
      value: string;
      priceDelta: number;
    }) => {
      const res = await api.post(
        `/products/${productId}/options/${optionId}/values`,
        { value, priceDelta }
      );
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-options", productId] });
    },
  });
}

export function useDeleteOptionValue(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      optionId,
      valueId,
    }: {
      optionId: string;
      valueId: string;
    }) => {
      await api.delete(
        `/products/${productId}/options/${optionId}/values/${valueId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-options", productId] });
    },
  });
}

// ── Variants ────────────────────────────────────────────────

export function useProductVariants(productId: string | null) {
  return useQuery<{ variants: Variant[] }>({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      if (!productId) return { variants: [] };
      const res = await api.get(`/variants?productId=${productId}`);
      return { variants: res.data?.data ?? [] };
    },
    enabled: !!productId,
  });
}

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      sku: string;
      optionValueIds?: string[];
      price?: number;
      initialStock?: number;
      isActive?: boolean;
    }) => {
      const res = await api.post("/variants", { productId, ...data });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useToggleVariantActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      variantId,
      productId,
      isActive,
    }: {
      variantId: string;
      productId: string;
      isActive: boolean;
    }) => {
      await api.patch(`/variants/${variantId}`, { isActive });
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variantId: string) => {
      await api.delete(`/variants/${variantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
