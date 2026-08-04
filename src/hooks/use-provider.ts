import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

export type Condition = "NEW" | "GOOD" | "FAIR";
export type OrderStatus = "PLACED" | "CONFIRMED" | "PAID" | "PICKED_UP" | "RETURNED" | "CANCELLED";

export interface ProviderOrder {
  id: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
  status: OrderStatus;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  items: {
    id: string;
    rentalOrderId: string;
    gearItemId: string;
    quantity: number;
    pricePerDay: string;
    gearItem?: {
      id: string;
      name: string;
      providerId: string;
    };
  }[];
}

export interface ProviderGearItem {
  id: string;
  providerId: string;
  categoryId: string;
  name: string;
  description: string;
  brand: string;
  images: string[];
  pricePerDay: string;
  stockQuantity: number;
  availableQuantity: number;
  condition: Condition;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

export function useProviderOrders() {
  return useQuery({
    queryKey: ["provider-orders"],
    queryFn: async () => {
      const res: any = await api.get("/api/provider/orders");
      return (res.data || []) as ProviderOrder[];
    },
  });
}

export function useProviderGear() {
  return useQuery({
    queryKey: ["provider-gear"],
    queryFn: async () => {
      const res: any = await api.get("/api/provider/gear");
      const gearData = Array.isArray(res.data) ? res.data : [];
      return gearData as ProviderGearItem[];
    },
    refetchOnWindowFocus: true,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/api/provider/orders/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    },
  });
}

export function useAddGear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post("/api/provider/gear", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-gear"] });
      queryClient.invalidateQueries({ queryKey: ["gear"] });
      queryClient.refetchQueries({ queryKey: ["provider-gear"] });
    },
  });
}

export function useDeleteGear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/provider/gear/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gear"] });
      queryClient.invalidateQueries({ queryKey: ["provider-gear"] });
    },
  });
}

export function useEditGear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => {
      const res = await api.put(`/api/provider/gear/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gear"] });
      queryClient.invalidateQueries({ queryKey: ["provider-gear"] });
    },
  });
}

export function useToggleGearAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isAvailable,
    }: {
      id: string;
      isAvailable: boolean;
    }) => {
      const res = await api.put(`/api/provider/gear/${id}`, { isAvailable });
      return res.data;
    },
    onMutate: async ({ id, isAvailable }) => {
      await queryClient.cancelQueries({ queryKey: ["provider-gear"] });
      const previousGear = queryClient.getQueryData(["provider-gear"]);

      if (previousGear) {
        queryClient.setQueryData(["provider-gear"], (old: any) => {
          if (Array.isArray(old?.data)) {
            return {
              ...old,
              data: old.data.map((item: any) =>
                item.id === id ? { ...item, isAvailable } : item
              ),
            };
          }
          return old;
        });
      }

      return { previousGear };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousGear) {
        queryClient.setQueryData(["provider-gear"], context.previousGear);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-gear"] });
    },
  });
}
