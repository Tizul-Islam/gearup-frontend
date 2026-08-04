import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  phone: string;
  address: string;
  activeStatus: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

export function useAuthUser() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const res = await api.get("/api/users/me");
      return res.data as User;
    },
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await api.put("/api/users/me", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });
}
