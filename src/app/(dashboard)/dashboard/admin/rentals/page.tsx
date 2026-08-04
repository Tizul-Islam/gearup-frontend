"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ListOrdered, Search } from "lucide-react";
import { useAdminRentals } from "@/hooks/use-admin";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const pageSize = 10;

export default function AdminRentalsPage() {
  const { data: rentals = [], isLoading } = useAdminRentals();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredRentals = useMemo(() => {
    const term = search.toLowerCase();
    return rentals.filter((rental) => {
      const haystack =
        `${rental.id} ${rental.customer?.name ?? ""} ${rental.customer?.email ?? ""}`.toLowerCase();
      return !term || haystack.includes(term);
    });
  }, [rentals, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRentals.length / pageSize));
  const pagedRentals = filteredRentals.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PLACED":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "CONFIRMED":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "PAID":
        return "bg-purple-500 hover:bg-purple-600 text-white";
      case "PICKED_UP":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "RETURNED":
        return "bg-gray-500 hover:bg-gray-600 text-white";
      case "CANCELLED":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Rental Moderation
          </h2>
          <p className="text-muted-foreground">
            Review bookings across the platform.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by order id or customer"
            className="pl-9 w-full sm:w-72"
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : !filteredRentals.length ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ListOrdered className="h-8 w-8 mb-2" />
                    <p>No rentals match your search.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pagedRentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell className="font-mono text-xs">
                    {rental.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {rental.customer?.name ?? "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {rental.customer?.email ?? ""}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {rental.items
                      ?.map(
                        (item) =>
                          `${item.gearItem?.name ?? "Item"} ×${item.quantity}`,
                      )
                      .join(", ")}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(rental.startDate), "MMM dd, yyyy")} -{" "}
                    {format(new Date(rental.endDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${Number(rental.totalAmount ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeVariant(rental.status)}>
                      {rental.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(rental.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
