"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCustomerOrder } from "@/hooks/use-customer";
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

export default function CustomerPayPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: order, isLoading } = useCustomerOrder(id);

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/payments/create", {
        rentalOrderId: id,
      });
      return response as { data?: { checkoutUrl?: string } };
    },
    onSuccess: (response) => {
      const checkoutUrl = (response as { data?: { checkoutUrl?: string } }).data
        ?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      toast.success("Payment initialized.");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unable to start checkout.";
      toast.error(message);
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  if (!order) return <div className="text-center py-12">Order not found.</div>;

  if (order.status !== "CONFIRMED") {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/customer"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Payment unavailable</CardTitle>
            <CardDescription>
              Waiting for the provider to confirm this order before you can pay.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>{order.status}</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/customer"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Pay with Stripe</CardTitle>
          <CardDescription>
            Complete the payment for order #{order.id.slice(0, 8)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="font-medium">Order total</p>
            <p className="text-2xl font-semibold">
              ${Number(order.totalAmount || 0).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              This will redirect you to Stripe checkout.
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => paymentMutation.mutate()}
            disabled={paymentMutation.isPending}
          >
            {paymentMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" /> Pay with Stripe
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
