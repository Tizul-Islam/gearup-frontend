"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Calendar as CalendarIcon,
  MapPin,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useGearDetails } from "@/hooks/use-gear";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/services/api";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/auth-context";

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = params.id as string;

  const startDateStr = searchParams.get("start");
  const endDateStr = searchParams.get("end");
  const quantityStr = searchParams.get("quantity");
  const quantity = quantityStr ? parseInt(quantityStr, 10) : 1;

  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [coupon, setCoupon] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("STRIPE");

  const { data: gear, isLoading, isError } = useGearDetails(id);

  // Checkout mutations
  const createRentalMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to complete checkout.");
      }

      // Step 1: Create Rental Order
      const rentalRes = await api.post("/api/rentals", {
        startDate: startDateStr,
        endDate: endDateStr,
        items: [
          {
            gearId: id,
            quantity: quantity,
          },
        ],
      });

      const rentalOrderId = rentalRes.data?.id;
      if (!rentalOrderId) throw new Error("Failed to create rental order.");

      // Step 2: Initialize Payment
      const paymentRes = await api.post("/api/payments/create", {
        rentalOrderId,
        method: paymentMethod,
      });

      return paymentRes;
    },
    onSuccess: (data) => {
      toast.success("Order placed successfully! Redirecting to payment...");
      // In a real app, redirect to Stripe checkout URL or render SSLCommerz gateway
      setTimeout(() => {
        router.push("/dashboard/customer/rentals");
      }, 1500);
    },
    onError: (error: any) => {
      if (error.message === "You must be logged in to complete checkout.") {
        toast.error(error.message);
        router.push(
          `/login?redirect=/checkout/${id}?start=${startDateStr}&end=${endDateStr}&quantity=${quantity}`,
        );
      } else {
        toast.error(error.message || "Checkout failed. Please try again.");
      }
    },
  });

  if (!startDateStr || !endDateStr) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Missing Rental Dates</h2>
        <p className="text-muted-foreground mb-8">
          Please select dates from the gear details page first.
        </p>
        <Button onClick={() => router.push(`/gear/${id}`)}>Go Back</Button>
      </div>
    );
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[600px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !gear) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Gear not found</h2>
        <Button onClick={() => router.push("/gear")}>Browse Gear</Button>
      </div>
    );
  }

  const subtotal = days * gear.pricePerDay * quantity;
  const serviceFee = Math.round(subtotal * 0.1);
  const discount = coupon === "GEARUP10" ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + serviceFee - discount;

  const handleCheckout = () => {
    createRentalMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl bg-muted/20 min-h-[calc(100vh-140px)]">
      <Link
        href={`/gear/${gear.id}`}
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-6 -ml-4 text-muted-foreground hover:text-foreground",
        })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to gear details
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Confirm and pay
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column - Checkout Form */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Your trip</h2>
            <div className="flex flex-col gap-4 bg-card border rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Dates</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, "MMM dd, yyyy")} -{" "}
                    {format(endDate, "MMM dd, yyyy")}
                  </p>
                </div>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push(`/gear/${id}`)}
                >
                  Edit
                </Button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Duration</h3>
                  <p className="text-sm text-muted-foreground">{days} days</p>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Pick-up location</h3>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    Exact location provided after booking
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-bold mb-4">Pay with</h2>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="STRIPE" id="stripe" />
                <Label
                  htmlFor="stripe"
                  className="flex-1 flex justify-between cursor-pointer"
                >
                  <span className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Credit Card (Stripe)
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="SSLCOMMERZ" id="sslcommerz" />
                <Label
                  htmlFor="sslcommerz"
                  className="flex-1 flex justify-between cursor-pointer"
                >
                  <span className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> SSLCommerz
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-bold mb-4">Required for your trip</h2>
            <div className="space-y-4 bg-primary/5 border border-primary/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Provider Rules</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please return the gear in the same condition as you received
                    it. Any damage must be reported immediately.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(val) =>
                        setTermsAccepted(val as boolean)
                      }
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      I agree to the provider's rules and terms of service.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-14 text-lg mt-4"
            disabled={!termsAccepted || createRentalMutation.isPending}
            onClick={handleCheckout}
          >
            {createRentalMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              "Confirm and pay"
            )}
          </Button>
        </div>

        {/* Right Column - Summary Card */}
        <div className="md:col-span-5 lg:col-span-4 relative">
          <Card className="sticky top-24 shadow-xl border-border/50 bg-card/80 backdrop-blur-xl">
            <CardHeader className="flex flex-row gap-4 items-start pb-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                <img
                  src={
                    gear.images?.[0] ||
                    "https://images.unsplash.com/photo-1504280650214-118833959140?w=200&auto=format&fit=crop"
                  }
                  alt={gear.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                  {gear.category?.name || "Gear"}
                </p>
                <CardTitle className="text-lg line-clamp-2 leading-tight">
                  {gear.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  Provider: {gear.provider?.name || "Local Provider"}
                </CardDescription>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Price details</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    ${gear.pricePerDay} x {days} days
                  </span>
                  <span>${subtotal}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span className="underline decoration-dotted cursor-help">
                    Service fee
                  </span>
                  <span>${serviceFee}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount applied</span>
                    <span>-${discount}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-lg pt-1">
                  <span>Total (USD)</span>
                  <span>${total}</span>
                </div>
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="pt-4 flex flex-col items-start gap-4 bg-muted/30">
              <div className="w-full relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter coupon code"
                  className="pl-9 pr-20"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                  disabled={!coupon}
                >
                  Apply
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Hint: Try using "GEARUP10" for 10% off the subtotal!
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
