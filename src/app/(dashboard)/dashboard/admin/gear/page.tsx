"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ExternalLink, Package, Search } from "lucide-react";
import { useAdminGear } from "@/hooks/use-admin";

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

export default function AdminGearPage() {
  const { data: gearList = [], isLoading } = useAdminGear();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredGear = useMemo(() => {
    const term = search.toLowerCase();
    return gearList.filter((gear) => {
      const haystack =
        `${gear.name} ${gear.brand} ${gear.provider?.name ?? ""}`.toLowerCase();
      return !term || haystack.includes(term);
    });
  }, [gearList, search]);

  const totalPages = Math.max(1, Math.ceil(filteredGear.length / pageSize));
  const pagedGear = filteredGear.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gear Moderation</h2>
          <p className="text-muted-foreground">
            Review listings from all providers.
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
            placeholder="Search by name, brand, provider"
            className="pl-9 w-full sm:w-72"
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Price/Day</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : !filteredGear.length ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8 mb-2" />
                    <p>No gear matches your search.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pagedGear.map((gear) => (
                <TableRow key={gear.id}>
                  <TableCell>
                    <div className="font-medium">{gear.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {gear.brand}
                    </div>
                  </TableCell>
                  <TableCell>{gear.category?.name ?? "—"}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {gear.provider?.name ?? "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {gear.provider?.email ?? ""}
                    </div>
                  </TableCell>
                  <TableCell>${Number(gear.pricePerDay).toFixed(2)}</TableCell>
                  <TableCell>
                    {gear.availableQuantity ?? gear.stockQuantity}/
                    {gear.stockQuantity}
                  </TableCell>
                  <TableCell>
                    <Badge variant={gear.isAvailable ? "default" : "secondary"}>
                      {gear.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/gear/${gear.id}`}
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Link>
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
