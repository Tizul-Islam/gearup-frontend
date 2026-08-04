"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Package,
  Calendar,
  Clock,
  ArrowUpRight,
  Loader2,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import {
  useCustomerRentals,
  useCustomerPayments,
  useCancelRental,
  useSubmitReview,
  type RentalOrder,
} from "@/hooks/use-customer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PaymentRecord {
  id: string;
  transactionId?: string;
  amount?: string | number;
  method?: string;
  status?: string;
  createdAt?: string;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: rentalsData, isLoading: rentalsLoading } = useCustomerRentals();
  const { data: paymentsData, isLoading: paymentsLoading } =
    useCustomerPayments();
  const cancelRental = useCancelRental();
  const submitReview = useSubmitReview();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewedRentalIds, setReviewedRentalIds] = useState<Set<string>>(new Set());
  const [selectedRental, setSelectedRental] = useState<RentalOrder | null>(
    null,
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleReviewModalChange = (open: boolean) => {
    setReviewOpen(open);
    if (!open) {
      setTimeout(() => {
        setReviewSuccess(false);
        setComment("");
        setRating(5);
        setSelectedRental(null);
      }, 300);
    }
  };

  const rentals = useMemo(
    () => (rentalsData ?? []) as RentalOrder[],
    [rentalsData],
  );
  const payments = useMemo(
    () => (paymentsData ?? []) as PaymentRecord[],
    [paymentsData],
  );

  const activeRentals = rentals.filter((r) =>
    ["CONFIRMED", "PAID", "PICKED_UP"].includes(r.status),
  );
  const totalSpent = payments.reduce(
    (acc, payment) => acc + Number(payment.amount || 0),
    0,
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PLACED":
        return "bg-yellow-500 hover:bg-yellow-600 text-white border-transparent";
      case "CONFIRMED":
        return "bg-blue-500 hover:bg-blue-600 text-white border-transparent";
      case "PAID":
        return "bg-purple-500 hover:bg-purple-600 text-white border-transparent";
      case "PICKED_UP":
        return "bg-green-500 hover:bg-green-600 text-white border-transparent";
      case "RETURNED":
        return "bg-gray-500 hover:bg-gray-600 text-white border-transparent";
      case "CANCELLED":
        return "bg-red-500 hover:bg-red-600 text-white border-transparent";
      default:
        return "bg-secondary";
    }
  };

  const handleCancelRental = async (id: string) => {
    if (!window.confirm("Cancel this order?")) return;

    try {
      await cancelRental.mutateAsync(id);
      toast.success("Order cancelled successfully.");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to cancel this order right now.";
      toast.error(message);
    }
  };

  const handleReviewSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRental) return;

    const firstItem = selectedRental.items?.[0];
    const gearItemId = firstItem?.gearItemId || firstItem?.gearItem?.id;
    if (!gearItemId) {
      toast.error("This order is missing item details for review.");
      return;
    }

    submitReview.mutate(
      {
        rentalOrderId: selectedRental.id,
        gearItemId,
        rating,
        comment,
      },
      {
        onSuccess: () => {
          toast.success("Review submitted successfully!");
          setReviewSuccess(true);
          if (selectedRental) {
            setReviewedRentalIds((prev) => new Set(prev).add(selectedRental.id));
          }
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Failed to submit review";
          toast.error(
            message.includes("already")
              ? "You have already reviewed this item."
              : message,
          );
        },
      },
    );
  };

  const openReviewModal = (rental: RentalOrder) => {
    setSelectedRental(rental);
    setReviewOpen(true);
  };

  if (rentalsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Customer dashboard
        </h2>
        <p className="text-muted-foreground">
          Welcome back! Here is a quick view of your rentals and payments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rentals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime rentals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Rentals
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRentals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Returns
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rentals.filter((r) => r.status === "PICKED_UP").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Items to return
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${paymentsLoading ? "..." : totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime spending
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-7">
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Your recent rental orders and available actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rentals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You have not rented anything yet.
                </p>
                <Link
                  href="/gear"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Browse Gear
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {rentals.map((rental) => {
                  const firstItem = rental.items?.[0];
                  const gearName = firstItem?.gearItem?.name || "Gear item";
                  return (
                    <div
                      key={rental.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 gap-4"
                    >
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-medium leading-none">
                            {gearName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(rental.startDate), "MMM dd, yyyy")}{" "}
                            - {format(new Date(rental.endDate), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            Order #{rental.id.slice(0, 8)} • $
                            {Number(rental.totalAmount || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={getStatusBadgeVariant(rental.status)}>
                          {rental.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/dashboard/customer/orders/${rental.id}`,
                            )
                          }
                        >
                          View
                        </Button>
                        {rental.status === "PLACED" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelRental(rental.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        {rental.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/customer/orders/${rental.id}/pay`,
                              )
                            }
                          >
                            Pay Now
                          </Button>
                        )}
                        {(rental.status === "PICKED_UP" ||
                          rental.status === "RETURNED") &&
                          !reviewedRentalIds.has(rental.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewModal(rental)}
                          >
                            <Star className="mr-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-7 mt-4">
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>
              Your recent Stripe transactions and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No payments found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="hidden sm:grid grid-cols-5 gap-4 font-medium text-sm text-muted-foreground mb-2 px-2">
                  <div>Transaction ID</div>
                  <div>Amount</div>
                  <div>Method</div>
                  <div>Status</div>
                  <div>Date</div>
                </div>
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center border-b pb-4 last:border-0 px-2 text-sm"
                  >
                    <div className="font-mono text-xs truncate">
                      <span className="sm:hidden font-medium text-muted-foreground block mb-1">
                        TXN ID
                      </span>
                      {payment.transactionId || payment.id.slice(0, 12)}
                    </div>
                    <div className="font-bold">
                      <span className="sm:hidden font-medium text-muted-foreground block mb-1 font-sans text-xs">
                        Amount
                      </span>
                      ${Number(payment.amount || 0).toFixed(2)}
                    </div>
                    <div>
                      <span className="sm:hidden font-medium text-muted-foreground block mb-1 text-xs">
                        Method
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-indigo-50 text-indigo-700 border-indigo-200"
                      >
                        {payment.method === "STRIPE" ? "Stripe" : "Card"}
                      </Badge>
                    </div>
                    <div>
                      <span className="sm:hidden font-medium text-muted-foreground block mb-1 text-xs">
                        Status
                      </span>
                      <Badge
                        className={
                          payment.status === "COMPLETED"
                            ? "bg-green-500 hover:bg-green-600"
                            : payment.status === "FAILED"
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-yellow-500 hover:bg-yellow-600"
                        }
                      >
                        {payment.status || "PENDING"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      <span className="sm:hidden font-medium text-muted-foreground block mb-1 text-xs">
                        Date
                      </span>
                      {payment.createdAt
                        ? format(new Date(payment.createdAt), "MMM dd, yyyy")
                        : "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={reviewOpen} onOpenChange={handleReviewModalChange}>
        <DialogContent className="sm:max-w-md">
          {reviewSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center">Review Submitted!</h3>
              <p className="text-muted-foreground text-center">
                Thank you for your feedback on{" "}
                {selectedRental?.items?.[0]?.gearItem?.name || "this gear"}.
              </p>
              <Button 
                className="mt-4 w-full" 
                onClick={() => handleReviewModalChange(false)}
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Leave a Review</DialogTitle>
                <DialogDescription>
                  How was your experience with{" "}
                  {selectedRental?.items?.[0]?.gearItem?.name || "this gear"}?
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleReviewSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating (1-5)</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="comment">
                    Comment
                  </label>
                  <Textarea
                    id="comment"
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    required
                    rows={4}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitReview.isPending}
                >
                  {submitReview.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
