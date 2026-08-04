"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be exactly 6 characters." }),
});

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof otpSchema>) => {
    setIsPending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPending(false);
    
    if (data.otp === "123456") {
      toast.success("Verification successful!");
      router.push(`/reset-password?email=${encodeURIComponent(email)}&token=mock-token`);
    } else {
      toast.error("Invalid OTP. For demo use 123456");
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Check your email</h1>
        <p className="text-muted-foreground">
          We've sent a 6-digit verification code to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="123456"
            maxLength={6}
            className="text-center text-2xl tracking-widest h-14"
            {...form.register("otp")}
          />
          {form.formState.errors.otp && (
            <p className="text-sm text-destructive text-center">
              {form.formState.errors.otp.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
      </form>
    </>
  );
}

export default function OTPVerificationPage() {
  return (
    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />}>
      <OTPForm />
    </Suspense>
  );
}
