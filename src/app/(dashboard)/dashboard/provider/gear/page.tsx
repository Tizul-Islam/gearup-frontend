"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Search, PackageOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { 
  useProviderGear, 
  useDeleteGear, 
  useToggleGearAvailability 
} from "@/hooks/use-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function ProviderInventoryPage() {
  const { data: gears, isLoading, isError } = useProviderGear();
  const deleteGear = useDeleteGear();
  const toggleAvailability = useToggleGearAvailability();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [gearToDelete, setGearToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const filteredGears = (gears || []).filter(gear => 
    gear.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    gear.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGears.length / ITEMS_PER_PAGE);
  const paginatedGears = filteredGears.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleAvailability.mutate(
      { id, isAvailable: !currentStatus },
      {
        onSuccess: () => {
          toast.success(`Gear marked as ${!currentStatus ? 'Available' : 'Unavailable'}`);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update availability");
        }
      }
    );
  };

  const handleDelete = () => {
    if (!gearToDelete) return;
    
    deleteGear.mutate(gearToDelete, {
      onSuccess: () => {
        toast.success("Gear item deleted successfully");
        setGearToDelete(null);
      },
      onError: (err: any) => {
        // Spec: On 400 ("Cannot delete gear item with active rental orders"), show exact message
        toast.error(err.message || "Failed to delete gear");
        setGearToDelete(null);
      }
    });
  };

  return (
    <DashboardShell 
      role="provider" 
      title="Inventory Management" 
      description="Manage your listed gear, update stock, and track availability."
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search your inventory..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-full bg-card"
          />
        </div>
        <Link href="/dashboard/provider/gear/new">
          <Button className="rounded-full gradient-cta text-white shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Add New Gear
          </Button>
        </Link>
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
            Failed to load inventory. Please try again.
          </div>
        ) : gears?.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No gear listed yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start adding your outdoor gear to your inventory to rent it out and earn money.
            </p>
            <Link href="/dashboard/provider/gear/new">
              <Button className="rounded-full">Add New Gear</Button>
            </Link>
          </div>
        ) : filteredGears.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No gear found matching "{searchTerm}"
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Item Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price/Day</TableHead>
                  <TableHead>Stock (Avail/Total)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGears.map((gear) => (
                  <TableRow key={gear.id} className="group">
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={gear.images?.[0] || "/placeholder.jpg"}
                          alt={gear.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{gear.name}</div>
                      <div className="text-xs text-muted-foreground">{gear.brand}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {gear.category?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${Number(gear.pricePerDay).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className={gear.availableQuantity === 0 ? "text-destructive font-semibold" : "text-foreground font-medium"}>
                          {gear.availableQuantity}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-muted-foreground">{gear.stockQuantity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={gear.isAvailable} 
                          onCheckedChange={() => handleToggle(gear.id, gear.isAvailable)}
                          disabled={toggleAvailability.isPending}
                        />
                        <span className={gear.isAvailable ? "text-green-600 text-xs font-medium" : "text-muted-foreground text-xs"}>
                          {gear.isAvailable ? "Available" : "Hidden"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/provider/gear/${gear.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setGearToDelete(gear.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!gearToDelete} onOpenChange={(open) => !open && setGearToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this gear item from your inventory. 
              If this item has active rental orders, deletion will fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
              disabled={deleteGear.isPending}
            >
              {deleteGear.isPending ? "Deleting..." : "Delete Gear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  );
}
