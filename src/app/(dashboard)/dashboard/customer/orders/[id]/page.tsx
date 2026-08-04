"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCustomerOrder, type Review } from "@/hooks/use-customer";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";


export default function CustomerOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useCustomerOrder(id);

  const [reviewState, setReviewState] = React.useState<
    Record<string, { rating: number; comment: string }>
  >({});

  const submitReviewMutation = useMutation({
    mutationFn: async ({
      gearItemId,
      rating,
      comment,
    }: {
      gearItemId: string;
      rating: number;
      comment: string;
    }) => {
      return api.post("/api/reviews", {
        rentalOrderId: id,
        gearItemId,
        rating,
        comment,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customer-order", id] });
      queryClient.invalidateQueries({ queryKey: ["gear", variables.gearItemId, "reviews"] });
      toast.success("Thanks for your review!");
      setReviewState((prev) => {
        const newState = { ...prev };
        delete newState[variables.gearItemId];
        return newState;
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unable to submit review";
      if (message.includes("already") || message.includes("409")) {
        toast.error("You have already reviewed this item.");
        queryClient.invalidateQueries({ queryKey: ["customer-order", id] });
      } else {
        toast.error(message);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!order) return <div className="text-center py-12">Order not found.</div>;

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

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/customer"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
          <CardDescription>
            {format(new Date(order.startDate), "MMM dd, yyyy")} -{" "}
            {format(new Date(order.endDate), "MMM dd, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusBadgeVariant(order.status)}>
              {order.status}
            </Badge>
            <Badge variant="outline">
              Total ${Number(order.totalAmount || 0).toFixed(2)}
            </Badge>
          </div>
          <div className="space-y-3">
            {order.items.map((item) => {
              const gearItemId = item.gearItemId;
              const isReviewable = order.status === "PICKED_UP" || order.status === "RETURNED";
              const hasReview = reviewState[gearItemId]?.comment || false;

              return (
                <div key={item.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.gearItem?.images?.[0] && (
                        <img
                          src={item.gearItem.images[0]}
                          alt={item.gearItem.name}
                          className="h-16 w-16 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">
                          {item.gearItem?.name || "Gear item"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.gearItem?.brand} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
		    <div className="text-sm text-muted-foreground">
                      ${Number(item.pricePerDay || 0).toFixed(2)} / day
                    </div>
                  </div>
                  {isReviewable && !hasReview && (
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium">
                        Leave a review
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 cursor-pointer ${star <= (reviewState[gearItemId]?.rating ?? 5) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                            onClick={() =>
                              setReviewState((prev) => ({
                                ...prev,
                                [gearItemId]: {
                                  ...prev[gearItemId],
                                  rating: star,
                                  comment: prev[gearItemId]?.comment ?? "",
                                },
                              }))
                            }
                          />
                        ))}
                      </div>
                      <Textarea
                        placeholder="Share your experience"
                        value={reviewState[gearItemId]?.comment ?? ""}
                        onChange={(event) =>
                          setReviewState((prev) => ({
                            ...prev,
                            [gearItemId]: {
                              rating: prev[gearItemId]?.rating ?? 5,
                              comment: event.target.value,
                            },
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          submitReviewMutation.mutate({
                            gearItemId,
                            rating: reviewState[gearItemId]?.rating ?? 5,
                            comment: reviewState[gearItemId]?.comment ?? "",
                          })
                        }
                        disabled={submitReviewMutation.isPending}
                      >
                        {submitReviewMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          "Submit Review"
                        )}
                      </Button>
                    </div>
                  )}
                  {hasReview && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Your review:</p>
                      <div className="flex text-primary mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < (reviewState[gearItemId]?.rating ?? 5) ? "fill-primary" : "fill-muted text-muted"}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {reviewState[gearItemId]?.comment}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
