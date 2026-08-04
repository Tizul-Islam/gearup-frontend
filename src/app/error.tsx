"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16">
      <div className="bg-destructive/10 p-4 rounded-full mb-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Something went wrong!</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        We encountered an unexpected error. Please try again or return to the homepage.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="bg-primary text-primary-foreground">
          <RefreshCcw className="mr-2 h-4 w-4" /> Try again
        </Button>
        <a href="/" className={buttonVariants({ variant: "outline" })}>Go Home</a>
      </div>
    </div>
  );
}
