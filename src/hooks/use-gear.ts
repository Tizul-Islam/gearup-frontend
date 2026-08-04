import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export interface Gear {
  id: string;
  name: string;
  description: string;
  brand: string;
  categoryId: string;
  category: { id: string; name: string };
  images: string[];
  pricePerDay: number;
  stockQuantity: number;
  availableQuantity: number;
  condition: "NEW" | "GOOD" | "FAIR";
  isAvailable: boolean;
  providerId: string;
  provider: { id: string; name: string; email?: string; phone?: string | null };
  createdAt: string;
  updatedAt: string;
}

interface FetchGearParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  isAvailable?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useGearList(params?: FetchGearParams) {
  return useQuery({
    queryKey: ["gear", params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            query.append(key, String(value));
          }
        });
      }

      const res = await api.get(`/api/gear?${query.toString()}`);
      return res as any as {
        data: Gear[];
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    },
  });
}

export function useGearDetails(id: string) {
  return useQuery({
    queryKey: ["gear", id],
    queryFn: async () => {
      const res = await api.get(`/api/gear/${id}`);
      // The API returns { success, message, data: { ... } }
      // The interceptor returns the whole response body.
      return (res as any).data as Gear;
    },
    enabled: !!id,
  });
}

export function useGearReviews(id: string) {
  return useQuery({
    queryKey: ["gear", id, "reviews"],
    queryFn: async () => {
      const res = await api.get(`/api/gear/${id}/reviews`);
      return (res as any).data;
    },
    enabled: !!id,
  });
}
