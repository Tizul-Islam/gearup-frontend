import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getRoleFromToken(token?: string) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64Payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload =
      base64Payload + "=".repeat((4 - (base64Payload.length % 4)) % 4);
    const payload = JSON.parse(atob(paddedPayload));
    return typeof payload.role === "string" ? payload.role : null;
  } catch (error) {
    console.error("[Middleware] Error parsing token:", error);
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const userRole =
    getRoleFromToken(accessToken) ?? getRoleFromToken(refreshToken);

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/otp") ||
    pathname.startsWith("/reset-password");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isPaymentRoute = pathname.startsWith("/payment");
  const isCheckoutRoute = pathname.startsWith("/checkout");
  const isAuthenticated = Boolean(accessToken || refreshToken);

  console.log(`[Middleware] Path: ${pathname}`);
  console.log(`[Middleware] isAuthenticated: ${isAuthenticated}, userRole: ${userRole}`);

  if (isAuthRoute && isAuthenticated) {
    console.log(`[Middleware] Redirecting authenticated user from ${pathname} based on role: ${userRole}`);
    if (userRole === "ADMIN")
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    if (userRole === "PROVIDER")
      return NextResponse.redirect(new URL("/dashboard/provider", request.url));
    return NextResponse.redirect(new URL("/dashboard/customer", request.url));
  }

  if (
    !isAuthenticated &&
    (isDashboardRoute || isCheckoutRoute || isPaymentRoute)
  ) {
    console.log(`[Middleware] Unauthenticated user trying to access protected route: ${pathname}, redirecting to /login`);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isDashboardRoute) {
    if (pathname.startsWith("/dashboard/admin") && userRole !== "ADMIN") {
      console.log(`[Middleware] User role ${userRole} is not ADMIN, redirecting to /dashboard/customer`);
      return NextResponse.redirect(new URL("/dashboard/customer", request.url));
    }

    if (
      pathname.startsWith("/dashboard/provider") &&
      userRole !== "PROVIDER" &&
      userRole !== "ADMIN"
    ) {
      console.log(`[Middleware] User role ${userRole} is not PROVIDER or ADMIN, redirecting to /dashboard/customer`);
      return NextResponse.redirect(new URL("/dashboard/customer", request.url));
    }

    if (pathname.startsWith("/dashboard/customer") && userRole === "ADMIN") {
      console.log(`[Middleware] User role ${userRole} should access /dashboard/admin instead of /dashboard/customer`);
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
  }

  console.log(`[Middleware] Proceeding to next response for path: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/otp",
    "/reset-password",
    "/checkout/:path*",
    "/payment/:path*",
  ],
};
