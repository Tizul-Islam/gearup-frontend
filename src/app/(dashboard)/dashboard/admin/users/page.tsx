"use client";

import { useMemo, useState } from "react";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/use-admin";
import { format } from "date-fns";
import { Loader2, Search, Users } from "lucide-react";
import { toast } from "sonner";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const pageSize = 10;

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "ALL" | "CUSTOMER" | "PROVIDER" | "ADMIN"
  >("ALL");
  const [page, setPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    newStatus: "ACTIVE" | "SUSPENDED";
  }>({ open: false, userId: "", userName: "", newStatus: "ACTIVE" });

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !term || `${user.name} ${user.email}`.toLowerCase().includes(term);
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const handleUpdateStatus = (
    id: string,
    name: string,
    newStatus: "ACTIVE" | "SUSPENDED",
  ) => {
    setConfirmDialog({ open: true, userId: id, userName: name, newStatus });
  };

  const confirmUpdateStatus = () => {
    updateStatus.mutate(
      { id: confirmDialog.userId, activeStatus: confirmDialog.newStatus },
      {
        onSuccess: () => {
          toast.success(
            `User ${confirmDialog.newStatus === "ACTIVE" ? "activated" : "suspended"} successfully`,
          );
          setConfirmDialog({ open: false, userId: "", userName: "", newStatus: "ACTIVE" });
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update user status";
          toast.error(message);
          setConfirmDialog({ open: false, userId: "", userName: "", newStatus: "ACTIVE" });
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Search, moderate, and review platform users.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email"
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as typeof roleFilter);
              setPage(1);
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="PROVIDER">Provider</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
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
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : !filteredUsers.length ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-8 w-8 mb-2" />
                    <p>No users match your search.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pagedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.activeStatus === "ACTIVE"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {user.activeStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role !== "ADMIN" ? (
                      <Button
                        size="sm"
                        variant={
                          user.activeStatus === "ACTIVE"
                            ? "destructive"
                            : "default"
                        }
                        onClick={() =>
                          handleUpdateStatus(
                            user.id,
                            user.name,
                            user.activeStatus === "ACTIVE"
                              ? "SUSPENDED"
                              : "ACTIVE",
                          )
                        }
                        disabled={updateStatus.isPending}
                      >
                        {user.activeStatus === "ACTIVE"
                          ? "Suspend"
                          : "Activate"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Protected
                      </span>
                    )}
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

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.newStatus === "SUSPENDED" ? "Suspend User" : "Activate User"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.newStatus === "SUSPENDED"
                ? `Are you sure you want to suspend "${confirmDialog.userName}"? This will immediately block their login and all authenticated actions.`
                : `Are you sure you want to activate "${confirmDialog.userName}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, userId: "", userName: "", newStatus: "ACTIVE" })}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.newStatus === "SUSPENDED" ? "destructive" : "default"}
              onClick={confirmUpdateStatus}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? "Processing..." : confirmDialog.newStatus === "SUSPENDED" ? "Suspend" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
