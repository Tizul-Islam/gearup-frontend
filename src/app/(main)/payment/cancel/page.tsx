import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[70vh]">
      <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-2xl border shadow-sm">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground">
            Your payment was not completed. You can try again from your
            dashboard or return to browsing.
          </p>
        </div>

        <div className="pt-6 border-t flex flex-col gap-3">
          <Link
            href="/dashboard/customer"
            className={buttonVariants({ className: "w-full" })}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again from Dashboard
          </Link>
          <Link
            href="/gear"
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
