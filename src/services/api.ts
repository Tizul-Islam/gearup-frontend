import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

const clearAuthAndRedirect = () => {
  if (typeof window !== "undefined") {
    // We shouldn't try to clear HttpOnly cookies via document.cookie,
    // but clearing JS accessible ones is fine.
    document.cookie = "accessToken=; Max-Age=0; path=/; SameSite=Lax";
    document.cookie = "refreshToken=; Max-Age=0; path=/; SameSite=Lax";
    document.cookie = "userRole=; Max-Age=0; path=/; SameSite=Lax";
    localStorage.removeItem("accessToken");

    // Only redirect if not already on an auth route to prevent infinite loops
    const path = window.location.pathname;
    const isAuthRoute =
      path.startsWith("/login") ||
      path.startsWith("/register") ||
      path.startsWith("/forgot-password") ||
      path.startsWith("/reset-password");

    if (!isAuthRoute) {
      window.location.assign("/login");
    }
  }
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error.response?.data || error);
    }

    // Handle timeout errors specifically
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.warn("Request timeout - server might be waking up");
      // Don't reject immediately, let the UI handle it with a retry option
      return Promise.reject({
        message: "Server is waking up, please wait...",
        isTimeout: true,
      });
    }

    const isRefreshRequest = originalRequest.url?.includes(
      "/api/auth/refresh-token",
    );

    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.toLowerCase().includes("suspended")
    ) {
      clearAuthAndRedirect();
      if (typeof window !== "undefined") {
        window.location.assign("/login?error=suspended");
      }
      return Promise.reject(error.response?.data || error);
    }

    if (
      error.response?.status === 401 &&
      !isRefreshRequest &&
      typeof window !== "undefined"
    ) {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/login") && error.response?.data?.message) {
        return Promise.reject(error.response?.data || error);
      }
    }

    if (error.response?.status === 401) {
      if (isRefreshRequest) {
        clearAuthAndRedirect();
        return Promise.reject(error.response?.data || error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = api
            .post("/api/auth/refresh-token")
            .then((res: any) => {
              if (res?.data?.accessToken) {
                localStorage.setItem("accessToken", res.data.accessToken);
              }
              return undefined;
            })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        try {
          await refreshPromise;
          return api(originalRequest);
        } catch (refreshError) {
          clearAuthAndRedirect();
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error.response?.data || error);
  },
);
