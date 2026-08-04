"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCategories } from "@/hooks/use-categories";
import { useAdminGear } from "@/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();

  const defaultImages = [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-8 flex items-center gap-2 font-medium">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>›</span>
          <span className="text-foreground">Categories</span>
        </div>
        
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted border border-border/50 text-xs font-semibold uppercase tracking-wider mb-6 text-muted-foreground">
            Explore
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Every category, one platform</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Whatever the sport, there's maintained kit waiting nearby.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[240px] rounded-3xl overflow-hidden border border-border/10">
                <Skeleton className="h-full w-full" />
              </div>
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Tag className="h-8 w-8 mb-2" />
              <p>No categories found.</p>
            </div>
          ) : (
            categories.map((category, index) => {
              const count = category._count?.gearItems || 0;
              const imageUrl = category.imageUrl || defaultImages[index % defaultImages.length];
              return (
                <Link 
                  key={category.id} 
                  href={`/gear?category=${category.name}`}
                  className="group relative h-[240px] rounded-3xl overflow-hidden block border border-border/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Background Image */}
                  <Image 
                    src={imageUrl} 
                    alt={category.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl w-max mb-4 text-white">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                        <p className="text-sm text-white/80 font-medium">{count} items available</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-primary group-hover:border-primary transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Bottom Request Section */}
        <div className="bg-card border border-border/20 rounded-3xl p-12 text-center max-w-4xl mx-auto mb-16 shadow-lg">
          <h2 className="text-2xl font-bold mb-3 text-foreground">Can't find your sport?</h2>
          <p className="text-muted-foreground mb-8">
            Tell us what you need and we'll source it from local providers.
          </p>
          <Button className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12 font-semibold">
            Request gear
          </Button>
        </div>
      </div>
    </div>
  );
}
