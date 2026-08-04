"use server";

import { cookies } from "next/headers";
import { UserRole } from "@/contexts/auth-context";

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  role: string,
) {
  console.log(
    "[Server Action] setAuthCookies called with accessToken:",
    !!accessToken,
  );
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    path: "/",
    maxAge: 60 * 60, // 1 hour
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  cookieStore.set("refreshToken", refreshToken, {
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  cookieStore.set("userRole", role, {
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  console.log("[Server Action] Cookies set successfully!");
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("userRole");
}
