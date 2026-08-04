import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

export type OrderStatus = "PLACED" | "CONFIRMED" | "PAID" | "PICKED_UP" | "RETURNED" | "CANCELLED";
export type Condition = "NEW" | "GOOD" | "FAIR";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface RentalOrderItem {
  id: string;
  gearItemId: string;
  quantity: number;
  pricePerDay: string;
  gearItem?: {
    id: string;
    name: string;
    description: string;
    brand: string;
    images: string[];
    pricePerDay: string;
    stockQuantity: number;
    availableQuantity: number;
    condition: Condition;
    isAvailable: boolean;
    category?: { id: string; name: string };
    provider?: { id: string; name: string; email: string; phone: string | null };
  };
}

export interface RentalOrder {
  id: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
  status: OrderStatus;
  createdAt: string;
  items: RentalOrderItem[];
  payments?: Payment[];
}

export interface Payment {
  id: string;
  transactionId: string;
  rentalOrderId: string;
  amount: string;
  method: "STRIPE";
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  rentalOrder?: RentalOrder;
}

export interface Review {
  id: string;
  customerId: string;
  gearItemId: string;
  rentalOrderId: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer?: { id: string; name: string };
}

export function useCustomerRentals() {
  return useQuery({
    queryKey: ["customer-rentals"],
    queryFn: async () => {
      const res = await api.get("/api/rentals");
      return res.data as RentalOrder[];
    },
  });
}

export function useCustomerOrder(id: string) {
  return useQuery({
    queryKey: ["customer-order", id],
    queryFn: async () => {
      const res = await api.get(`/api/rentals/${id}`);
      return res.data as RentalOrder;
    },
    enabled: !!id,
  });
}

export function useCustomerPayments() {
  return useQuery({
    queryKey: ["customer-payments"],
    queryFn: async () => {
      const res = await api.get("/api/payments");
      return res.data;
    },
  });
}

export function useCancelRental() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/api/rentals/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-rentals"] });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { rentalOrderId: string; gearItemId: string; rating: number; comment: string }) => {
      const res = await api.post("/api/reviews", data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gear", variables.gearItemId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["customer-rentals"] });
    },
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { startDate: string; endDate: string; items: { gearItemId: string; quantity: number }[] }) => {
      const res = await api.post("/api/rentals", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-rentals"] });
    },
  });
}

export function useCreatePayment() {
  return useMutation({
    mutationFn: async (data: { rentalOrderId: string }) => {
      const res = await api.post("/api/payments/create", data);
      return res.data;
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { sessionId: string }) => {
      const res = await api.post("/api/payments/verify", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-payments"] });
      queryClient.invalidateQueries({ queryKey: ["customer-rentals"] });
    },
  });
}
