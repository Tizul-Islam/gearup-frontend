import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface GearCardProps {
  id: string;
  title: string;
  brand: string;
  pricePerDay: number;
  location: string;
  rating: number;
  reviews: number;
  isAvailable: boolean;
  imageUrl?: string;
  className?: string;
}

export function GearCard({
  id,
  title,
  brand,
  pricePerDay,
  location,
  rating,
  reviews,
  isAvailable,
  imageUrl,
  className,
}: GearCardProps) {
  // Use a fallback image if none provided
  const displayImage = imageUrl || "https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&q=80&w=800";

  return (
    <div className={cn("group flex flex-col rounded-xl bg-card border border-border/20 overflow-hidden hover:border-primary/30 transition-colors", className)}>
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={displayImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Availability Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10">
          <div className={cn("w-1.5 h-1.5 rounded-full", isAvailable ? "bg-green-500" : "bg-muted-foreground")} />
          <span className={cn("text-[10px] font-medium uppercase tracking-wider", isAvailable ? "text-green-500" : "text-muted-foreground")}>
            {isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        {/* Favorite Button */}
        <button className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors z-10">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4">
        <div className="mb-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {brand}
          </p>
          <h3 className="font-semibold text-foreground text-sm line-clamp-1 mt-0.5">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
            <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
            <span>({reviews})</span>
          </div>
          <div className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-lg">€{pricePerDay}</span>
            <span className="text-xs text-muted-foreground">/day</span>
          </div>
          <Link href={`/gear/${id}`}>
            <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-white h-7 px-4 text-xs font-semibold">
              View
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
