"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  MapPin,
  Shield,
  Star,
  Share2,
  Heart,
  ArrowLeft,
  Loader2,
  Check,
  Mail,
  Phone,
} from "lucide-react";
import { useGearDetails, useGearReviews } from "@/hooks/use-gear";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name?: string;
  };
}

interface RentalResponse {
  id?: string;
  data?: {
    id?: string;
  };
}

export default function GearDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { user, isAuthenticated } = useAuth();
  const { data: gear, isLoading, isError } = useGearDetails(id);
  const { data: reviewsData } = useGearReviews(id);
  const reviews = ((reviewsData as { data?: Review[] } | undefined)?.data ??
    []) as Review[];

  const [date, setDate] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [activeImage, setActiveImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [orderError, setOrderError] = React.useState<string | null>(null);

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (!date.from || !date.to) {
        throw new Error("Please select a rental date range.");
      }
      if (date.to <= date.from) {
        throw new Error("Pick-up date must be before return date.");
      }
      if (!isAuthenticated || user?.role !== "CUSTOMER") {
        throw new Error("Only customer accounts can rent gear.");
      }
      return api.post("/api/rentals", {
        startDate: date.from.toISOString(),
        endDate: date.to.toISOString(),
        items: [{ gearItemId: id, quantity }],
      });
    },
    onSuccess: (response: RentalResponse) => {
      const orderId = response?.data?.id || response?.id;
      toast.success("Order placed!");
      router.push(`/dashboard/customer/orders/${orderId}`);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to place the order right now.";
      if (message.includes("Only customer accounts")) {
        setOrderError(message);
        return;
      }
      if (message.includes("logged in") || message.includes("login")) {
        router.push(`/login?redirect=/gear/${id}`);
        return;
      }
      setOrderError(message);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="w-full aspect-4/3 rounded-xl" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="w-full h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !gear) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Gear not found</h2>
        <p className="text-muted-foreground mb-8">
          The item you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button onClick={() => router.push("/gear")}>Browse Gear</Button>
      </div>
    );
  }

  const days =
    date.from && date.to
      ? Math.ceil(
          (date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;
  const pricePerDay = Number(gear.pricePerDay);
  const subtotal = days > 0 ? days * pricePerDay * quantity : 0;
  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + serviceFee;
  const availableQuantity = gear.availableQuantity ?? gear.stockQuantity ?? 1;

  const handleCheckout = () => {
    if (!date.from || !date.to) {
      setOrderError("Please select a rental date range.");
      return;
    }
    if (date.to <= date.from) {
      setOrderError("Pick-up date must be before return date.");
      return;
    }
    if (!isAuthenticated) {
      router.push(`/login?redirect=/gear/${id}`);
      return;
    }
    if (user?.role !== "CUSTOMER") {
      setOrderError("Only customer accounts can rent gear.");
      return;
    }
    setOrderError(null);
    placeOrderMutation.mutate();
  };

  const images = gear.images?.length
    ? gear.images
    : [
        "https://images.unsplash.com/photo-1504280650214-118833959140?w=800&auto=format&fit=crop",
      ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link
        href="/gear"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-6 -ml-4 text-muted-foreground hover:text-foreground",
        })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to browsing
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column - Gallery & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative w-full aspect-4/3 sm:aspect-video rounded-xl overflow-hidden bg-muted">
              <img
                src={images[activeImage]}
                alt={gear.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-md backdrop-blur-md bg-background/80 hover:bg-background"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-md backdrop-blur-md bg-background/80 hover:bg-background"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 aspect-4/3 rounded-md overflow-hidden shrink-0 border-2 transition-all ${activeImage === idx ? "border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background" : "border-transparent hover:opacity-80"}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="uppercase tracking-wider">
                {gear.category?.name || "Gear"}
              </Badge>
              <Badge
                variant="outline"
                className="uppercase tracking-wider text-muted-foreground"
              >
                {gear.brand}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {gear.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 text-foreground">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium">4.8</span>
                <span className="text-muted-foreground underline">
                  ({reviews.length} reviews)
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Verified Provider
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
              <p>{gear.description}</p>
            </div>
          </div>

          <Separator />

          {/* Specifications */}
          <div>
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Condition</span>
                <span className="font-medium capitalize">
                  {gear.condition?.toLowerCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Available Quantity
                </span>
                <span className="font-medium">
                  {availableQuantity} of {gear.stockQuantity}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Brand</span>
                <span className="font-medium">{gear.brand}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Provider */}
          <div>
            <h2 className="text-xl font-bold mb-4">Provided by</h2>
            <div className="flex items-start gap-4 p-4 border rounded-xl bg-card">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {gear.provider?.name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {gear.provider?.name || "Local Provider"}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Joined in 2024
                </p>
                <div className="flex items-center gap-1 text-sm mb-2">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="font-medium">5.0</span>
                </div>
                {gear.provider?.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{gear.provider.email}</span>
                  </div>
                )}
                {gear.provider?.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{gear.provider.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold mb-6">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground italic">
                No reviews yet for this item.
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {review.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {review.user?.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-primary" : "fill-muted text-muted"}`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sticky Rent Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="shadow-xl border-border/50 bg-card/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold">
                    ${pricePerDay.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground pb-1">/ day</span>
                </div>
                {!gear.isAvailable || availableQuantity === 0 ? (
                  <Badge variant="destructive" className="w-fit">
                    Currently Rented
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="w-fit">
                    {availableQuantity} Available
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label>Dates</Label>
                  <Popover>
                    <PopoverTrigger
                      id="date"
                      className={buttonVariants({
                        variant: "outline",
                        className: `w-full justify-start text-left font-normal ${!date.from ? "text-muted-foreground" : ""}`,
                      })}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick your dates</span>
                      )}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={{ from: date.from, to: date.to }}
                        onSelect={(range) => {
                          setDate({ from: range?.from, to: range?.to });
                        }}
                        numberOfMonths={1}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <div className="w-12 text-center font-medium">
                      {quantity}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(Math.min(availableQuantity, quantity + 1))
                      }
                      disabled={quantity >= availableQuantity}
                    >
                      +
                    </Button>
                  </div>
                  {quantity >= availableQuantity && availableQuantity > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum available quantity reached.
                    </p>
                  )}
                </div>

                {days > 0 && (
                  <div className="space-y-3 pt-4 border-t border-border/50 animate-in fade-in">
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        ${pricePerDay.toFixed(2)} x {quantity} items x {days} days
                      </span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span className="underline decoration-dotted cursor-help">
                        Service fee
                      </span>
                      <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Estimated total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {orderError && (
                  <p className="text-sm text-destructive">{orderError}</p>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-12 text-lg font-semibold shadow-md"
                  disabled={
                    !gear.isAvailable ||
                    availableQuantity === 0 ||
                    !date.from ||
                    !date.to ||
                    placeOrderMutation.isPending ||
                    (isAuthenticated && user?.role !== "CUSTOMER")
                  }
                  onClick={handleCheckout}
                  title={
                    isAuthenticated && user?.role !== "CUSTOMER"
                      ? "Only customer accounts can rent gear"
                      : ""
                  }
                >
                  {placeOrderMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : !gear.isAvailable || availableQuantity === 0 ? (
                    "Not Available"
                  ) : isAuthenticated && user?.role !== "CUSTOMER" ? (
                    "Only customers can rent"
                  ) : (
                    "Rent Now"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You won&apos;t be charged yet
                </p>
              </CardContent>
              <CardFooter className="bg-muted/50 border-t border-border flex flex-col p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4 text-primary" />
                  GearUp Guarantee
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 w-full">
                  <li className="flex items-start gap-2">
                    <Check className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    <span>Free cancellation up to 48 hours before</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    <span>Damage protection included</span>
                  </li>
                </ul>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
