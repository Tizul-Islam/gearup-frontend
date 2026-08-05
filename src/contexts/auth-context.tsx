"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  activeStatus: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  getDashboardPath: (role?: UserRole | null) => string;
}

function extractAuthUser(response: unknown): AuthUser | null {
  if (response && typeof response === "object" && "data" in response) {
    const payload = (response as { data?: unknown }).data;
    if (payload && typeof payload === "object") {
      return payload as AuthUser;
    }
  }

  if (response && typeof response === "object") {
    return response as AuthUser;
  }

  return null;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

export function getDashboardPath(role?: UserRole | null) {
  if (role === "ADMIN") {
    return "/dashboard/admin";
  }
  if (role === "PROVIDER") {
    return "/dashboard/provider";
  }
  return "/dashboard/customer";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const authQuery = useQuery<AuthUser | null>({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const response = await api.get("/api/auth/me");
      return extractAuthUser(response);
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    throwOnError: false,
  });

  const user = authQuery.data ?? null;
  const isAuthenticated = Boolean(user);
  const isLoading = authQuery.isLoading;

  const refreshAuth = React.useCallback(async () => {
    await authQuery.refetch();
  }, [authQuery]);

  const login = React.useCallback(
    async (credentials: { email: string; password: string }) => {
      // 1. Backend returns tokens and sets cookies via proxy
      const loginResponse: any = await api.post("/api/auth/login", credentials);
      if (loginResponse?.data?.accessToken) {
        localStorage.setItem("accessToken", loginResponse.data.accessToken);
      }

      // 2. Frontend fetches user profile now that cookies are set
      const response = await api.get("/api/auth/me");
      const profile = extractAuthUser(response);
      if (!profile) {
        throw new Error("Unable to load your profile after login.");
      }

      // 3. Update React Query
      queryClient.setQueryData(["auth-user"], profile);

      // 4. Return profile (triggering redirect in the component)
      return profile;
    },
    [queryClient],
  );

  const logout = React.useCallback(async () => {
    // 1. Call backend logout endpoint first to clear HttpOnly cookies
    try {
      await api.post("/api/auth/logout");
    } catch (e) {
      console.error("Logout API error:", e);
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }

    // 2. Clear React Query state
    queryClient.setQueryData(["auth-user"], null);
    queryClient.removeQueries({ queryKey: ["auth-user"] });

    // 3. Redirect to login
    router.replace("/login");
  }, [queryClient, router]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      refreshAuth,
      getDashboardPath,
    }),
    [user, isLoading, isAuthenticated, login, logout, refreshAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
