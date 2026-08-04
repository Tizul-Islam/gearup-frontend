import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

export interface AdminStats {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  totalGearItems: number;
  totalRentalOrders: number;
  ordersByStatus: Record<string, number>;
  totalPaymentsCompleted: number;
  totalRevenue: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  phone: string | null;
  address: string | null;
  activeStatus: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

export interface AdminGearItem {
  id: string;
  name: string;
  brand: string;
  pricePerDay: number | string;
  stockQuantity: number;
  availableQuantity: number;
  condition: "NEW" | "GOOD" | "FAIR";
  isAvailable: boolean;
  createdAt: string;
  category: { name: string };
  provider: { id: string; name: string; email: string };
  images?: string[];
}

export interface AdminRentalOrder {
  id: string;
  startDate: string;
  endDate: string;
  totalAmount: number | string;
  status:
    | "PLACED"
    | "CONFIRMED"
    | "PAID"
    | "PICKED_UP"
    | "RETURNED"
    | "CANCELLED";
  createdAt: string;
  customer: { id: string; name: string; email: string };
  items: Array<{
    id: string;
    quantity: number;
    gearItem: { id: string; name: string; providerId: string };
  }>;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/api/admin/stats");
      return res.data as AdminStats;
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/api/admin/users");
      return res.data as AdminUser[];
    },
  });
}

export function useAdminGear() {
  return useQuery({
    queryKey: ["admin-gear"],
    queryFn: async () => {
      const res = await api.get("/api/admin/gear");
      return res.data as AdminGearItem[];
    },
  });
}

export function useAdminRentals() {
  return useQuery({
    queryKey: ["admin-rentals"],
    queryFn: async () => {
      const res = await api.get("/api/admin/rentals");
      return res.data as AdminRentalOrder[];
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      activeStatus,
    }: {
      id: string;
      activeStatus: "ACTIVE" | "SUSPENDED";
    }) => {
      const res = await api.patch(`/api/admin/users/${id}`, { activeStatus });
      return res.data;
    },
    onMutate: async ({ id, activeStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const previousUsers = queryClient.getQueryData<AdminUser[]>([
        "admin-users",
      ]);

      if (previousUsers) {
        queryClient.setQueryData<AdminUser[]>(["admin-users"], (users = []) =>
          users.map((user) =>
            user.id === id ? { ...user, activeStatus } : user,
          ),
        );
      }

      return { previousUsers };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin-users"], context.previousUsers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
