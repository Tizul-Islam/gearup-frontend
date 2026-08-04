"use client";

import Link from "next/link";
import {
  Activity,
  Package,
  ShoppingBag,
  Users,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { useAdminStats } from "@/hooks/use-admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const statusOrder = [
  "PLACED",
  "CONFIRMED",
  "PAID",
  "PICKED_UP",
  "RETURNED",
  "CANCELLED",
] as const;

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Overview</h2>
          <p className="text-muted-foreground">
            Platform statistics and moderation shortcuts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["Users", "/dashboard/admin/users"],
            ["Gear", "/dashboard/admin/gear"],
            ["Rentals", "/dashboard/admin/rentals"],
            ["Categories", "/dashboard/admin/categories"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {label} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalCustomers} Customers · {stats.totalProviders}{" "}
              Providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Gear Items
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalGearItems.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Listings currently on the platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Rental Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRentalOrders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all booking stages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              from {stats.totalPaymentsCompleted} completed payments
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold">Order Status Snapshot</h3>
          <p className="text-muted-foreground text-sm">
            Quick view of where rentals are currently sitting.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusOrder.map((status) => {
            const count = stats.ordersByStatus[status] ?? 0;
            
            // Map styles and icons based on status
            let config = {
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
              label: "Placed",
              icon: <ShoppingBag className="h-5 w-5" />
            };

            switch (status) {
              case "CONFIRMED":
                config = { color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20", label: "Confirmed", icon: <BadgeCheck className="h-5 w-5" /> };
                break;
              case "PAID":
                config = { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Paid", icon: <Activity className="h-5 w-5" /> };
                break;
              case "PICKED_UP":
                config = { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Picked Up", icon: <Package className="h-5 w-5" /> };
                break;
              case "RETURNED":
                config = { color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", label: "Returned", icon: <Activity className="h-5 w-5" /> };
                break;
              case "CANCELLED":
                config = { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Cancelled", icon: <Users className="h-5 w-5" /> };
                break;
            }

            return (
              <Card key={status} className={`overflow-hidden border ${config.border} bg-card hover:shadow-md transition-all duration-300`}>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full gap-3 relative">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  <div className={`p-3 rounded-2xl ${config.bg} ${config.color} relative z-10`}>
                    {config.icon}
                  </div>
                  <div className="relative z-10">
                    <p className="text-3xl font-black tracking-tight">{count}</p>
                    <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${config.color}`}>
                      {config.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
