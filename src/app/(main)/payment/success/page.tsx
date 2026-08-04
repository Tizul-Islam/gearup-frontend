"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/services/api";
import { Button, buttonVariants } from "@/components/ui/button";

function PaymentSuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const verifyMutation = useMutation({
    mutationFn: async () => api.post("/api/payments/verify", { sessionId }),
    onError: () => {
      toast.error("We could not verify this payment yet.");
    },
  });

  React.useEffect(() => {
    if (sessionId) {
      verifyMutation.mutate();
    }
  }, [sessionId]);

  return (
    <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[70vh]">
      <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-2xl border shadow-sm">
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            {verifyMutation.isPending
              ? "Verifying your payment with Stripe..."
              : verifyMutation.isError
                ? "The payment could not be verified automatically. Please check your order history."
                : "Your rental order has been confirmed and paid. The gear provider has been notified."}
          </p>
        </div>

        {verifyMutation.isPending && (
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying
            payment...
          </div>
        )}

        {verifyMutation.isError && (
          <div className="flex items-center justify-center text-sm text-destructive">
            <AlertCircle className="mr-2 h-4 w-4" /> Could not verify payment
            yet.
          </div>
        )}

        <div className="pt-6 border-t flex flex-col gap-3">
          <Link
            href="/dashboard/customer"
            className={buttonVariants({
              className:
                "w-full bg-gradient-to-r from-primary to-accent text-white",
            })}
          >
            View My Orders
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/gear"
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
          >
            Browse More Gear
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <React.Suspense fallback={null}>
      <PaymentSuccessPageContent />
    </React.Suspense>
  );
}
