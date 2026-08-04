"use client";

import React from "react";
import Link from "next/link";
import { Package, ShoppingBag, Activity, ArrowRight, Plus } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth";
import { useProviderGear, useProviderOrders } from "@/hooks/use-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ProviderOverviewPage() {
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const { data: gears, isLoading: isGearLoading } = useProviderGear();
  const { data: orders, isLoading: isOrdersLoading } = useProviderOrders();

  const isLoading = isUserLoading || isGearLoading || isOrdersLoading;

  if (isLoading) {
    return (
      <DashboardShell role="provider" title="Overview" description="Loading dashboard...">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </DashboardShell>
    );
  }

  const gearCount = gears?.length || 0;
  
  // Calculate Orders metrics
  const activeRentals = orders?.filter(o => o.status === "PICKED_UP").length || 0;
  const pendingOrders = orders?.filter(o => o.status === "PLACED" || o.status === "PAID").length || 0;
  
  // Recent orders (last 5, sorted by createdAt descending)
  const recentOrders = [...(orders || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLACED":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">New</Badge>;
      case "CONFIRMED":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Confirmed</Badge>;
      case "PAID":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Paid</Badge>;
      case "PICKED_UP":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case "RETURNED":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Returned</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardShell 
      role="provider" 
      title="Overview" 
      description={`Welcome back, ${user?.name || "Provider"}!`}
    >
      {gearCount === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-full mb-6">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Welcome to GearUp Provider!</h3>
          <p className="text-muted-foreground max-w-md text-lg mb-8">
            You don't have any gear listed yet. List your first item to start earning from your idle gear.
          </p>
          <Link href="/dashboard/provider/gear/new">
            <Button className="rounded-full px-8 text-white gradient-cta">
              <Plus className="mr-2 h-5 w-5" />
              List your first item
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Gear Listed</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gearCount}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeRentals}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <Link href="/dashboard/provider/orders" className="text-sm text-primary hover:underline flex items-center">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <Card className="rounded-2xl shadow-sm bg-muted/20 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">No orders yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {recentOrders.map((order) => (
                  <Card key={order.id} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">Order #{order.id.substring(0, 8)}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customer?.name} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${Number(order.totalAmount).toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
