"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Check, Package, RotateCcw, ShoppingBag, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useProviderOrders, useUpdateOrderStatus, OrderStatus } from "@/hooks/use-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProviderOrdersPage() {
  const { data: orders, isLoading, isError } = useProviderOrders();
  const updateOrder = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    updateOrder.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Order marked as ${newStatus.replace("_", " ")}`);
        },
        onError: (err: any) => {
          // If PATCH is rejected (e.g. status changed underneath), refetch the true status
          toast.error(err.message || "Failed to update order status");
          queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
        }
      }
    );
  };

  const getStatusBadge = (status: OrderStatus) => {
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

  const getActionButton = (orderId: string, status: OrderStatus) => {
    const isPending = updateOrder.isPending && updateOrder.variables?.id === orderId;

    switch (status) {
      case "PLACED":
        return (
          <Button 
            size="sm" 
            className="rounded-full w-full" 
            onClick={() => handleStatusChange(orderId, "CONFIRMED")}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-1 h-3 w-3" /> Confirm</>}
          </Button>
        );
      case "CONFIRMED":
        return (
          <Button size="sm" variant="outline" className="rounded-full w-full text-muted-foreground" disabled>
            Waiting for payment
          </Button>
        );
      case "PAID":
        return (
          <Button 
            size="sm" 
            className="rounded-full w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
            onClick={() => handleStatusChange(orderId, "PICKED_UP")}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Package className="mr-1 h-3 w-3" /> Mark Picked Up</>}
          </Button>
        );
      case "PICKED_UP":
        return (
          <Button 
            size="sm" 
            className="rounded-full w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
            onClick={() => handleStatusChange(orderId, "RETURNED")}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RotateCcw className="mr-1 h-3 w-3" /> Mark Returned</>}
          </Button>
        );
      case "RETURNED":
      case "CANCELLED":
      default:
        return null;
    }
  };

  // Filter orders based on tabs and search
  const filteredOrders = (orders || []).filter((order) => {
    // Tab filter
    if (activeTab === "needs_action") {
      if (!["PLACED", "PAID", "PICKED_UP"].includes(order.status)) return false;
    } else if (activeTab === "completed") {
      if (!["RETURNED", "CANCELLED"].includes(order.status)) return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchId = order.id.toLowerCase().includes(searchLower);
      const matchCustomer = order.customer?.name.toLowerCase().includes(searchLower) || 
                            order.customer?.email.toLowerCase().includes(searchLower);
      const matchItems = order.items.some(item => item.gearItem?.name.toLowerCase().includes(searchLower));
      
      return matchId || matchCustomer || matchItems;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when tab or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  return (
    <DashboardShell 
      role="provider" 
      title="Order Management" 
      description="Manage your rental orders, confirm bookings, and track returns."
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all" className="rounded-full">All Orders</TabsTrigger>
            <TabsTrigger value="needs_action" className="rounded-full">Needs Action</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-full">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, customer, or item..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-full bg-card"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-destructive">
            Failed to load orders. Please try again.
          </div>
        ) : orders?.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground max-w-md">
              When customers rent your gear, their orders will appear here for you to manage.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No orders found for the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[150px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell className="font-medium text-xs">
                      #{order.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customer?.name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer?.email}</div>
                    </TableCell>
                    <TableCell>
                      <ul className="text-sm list-inside list-disc">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="text-muted-foreground line-clamp-1">
                            {item.quantity}x {item.gearItem?.name || "Unknown item"}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{format(new Date(order.startDate), "MMM dd")} -</div>
                      <div>{format(new Date(order.endDate), "MMM dd, yyyy")}</div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${Number(order.totalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-right align-middle">
                      {getActionButton(order.id, order.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-full"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
