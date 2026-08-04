"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Shield, Clock, MapPin, Tent, Bike, Waves, Snowflake, Mountain, Dumbbell, Map, Users, Star, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GearCard } from "@/components/shared/gear-card";
import Image from "next/image";
import { useGearList } from "@/hooks/use-gear";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { name: "Camping", icon: Tent, count: 128 },
  { name: "Cycling", icon: Bike, count: 94 },
  { name: "Water Sports", icon: Waves, count: 71 },
  { name: "Winter Sports", icon: Snowflake, count: 63 },
  { name: "Climbing", icon: Mountain, count: 55 },
  { name: "Fitness", icon: Dumbbell, count: 88 },
  { name: "Trekking", icon: Map, count: 102 },
  { name: "Team Sports", icon: Users, count: 47 },
];

export default function Home() {
  const { data: featuredData, isLoading: featuredLoading } = useGearList({
    limit: 4,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: trendingData, isLoading: trendingLoading } = useGearList({
    limit: 4,
    sortBy: "pricePerDay",
    sortOrder: "asc",
  });

  const featuredGear = featuredData?.data || [];
  const trendingGear = trendingData?.data || [];
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                GearUp - The outdoors await
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Rent the gear. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Keep the adventure.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
                Premium sports and outdoor equipment from verified local providers. Booked by the day, insured, and ready when you are.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/gear">
                  <Button size="lg" className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12 text-base shadow-lg shadow-primary/25">
                    Browse gear <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/provider">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-12 text-base border-border/50 bg-background hover:bg-muted">
                    List your gear
                  </Button>
                </Link>
              </div>

              <div className="p-2 bg-card border border-border/40 rounded-full flex flex-col sm:flex-row items-center gap-2 max-w-xl">
                <div className="flex-1 flex items-center px-4 w-full sm:w-auto">
                  <Search className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                  <Input type="text" placeholder="What gear do you need?" className="border-0 focus-visible:ring-0 bg-transparent px-0 text-base shadow-none h-10 w-full" />
                </div>
                <div className="h-6 w-px bg-border hidden sm:block"></div>
                <div className="flex-1 flex items-center px-4 w-full sm:w-auto border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">
                  <MapPin className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                  <Input type="text" placeholder="All locations" className="border-0 focus-visible:ring-0 bg-transparent px-0 text-base shadow-none h-10 w-full" />
                </div>
                <Button className="rounded-full bg-primary hover:bg-primary/90 text-white w-full sm:w-auto h-12 px-6 mt-2 sm:mt-0">
                  Search
                </Button>
              </div>
            </div>

            {/* Right Content (Masonry Grid) */}
            <div className="hidden lg:grid grid-cols-2 gap-4 h-[600px]">
              <div className="grid grid-rows-2 gap-4">
                <div className="relative rounded-3xl overflow-hidden bg-muted">
                  <Image src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80&w=800" alt="Cyclists" fill className="object-cover" />
                </div>
                <div className="relative rounded-3xl overflow-hidden bg-muted">
                  <Image src="https://images.unsplash.com/photo-1516636171971-ce83d6a2f778?auto=format&fit=crop&q=80&w=800" alt="Coast" fill className="object-cover" />
                  <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-full">
                      <Tent className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Trending now: Tents</p>
                      <p className="text-[10px] text-muted-foreground">High demand in your area</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-rows-3 gap-4">
                <div className="relative rounded-3xl overflow-hidden bg-muted row-span-1">
                  <Image src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" alt="Shoes" fill className="object-cover" />
                </div>
                <div className="relative rounded-3xl overflow-hidden bg-muted row-span-2">
                  <Image src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" alt="Gym weights" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 border-t border-border/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular categories</h2>
              <p className="text-muted-foreground">Find what you're looking for by exploring our top categories.</p>
            </div>
            <Link href="/categories" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              All categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.name} href={`/gear?category=${cat.name}`} className="flex items-center gap-4 bg-card hover:bg-card/80 border border-border/20 rounded-2xl p-4 transition-colors group">
                  <div className="bg-primary/10 text-primary p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.count} items</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Gear */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured gear</h2>
              <p className="text-muted-foreground">Must-have pieces from our top-rated providers.</p>
            </div>
            <Link href="/gear" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border bg-card">
                  <Skeleton className="h-[200px] w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-8 w-1/4 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : featuredGear.length > 0 ? (
              featuredGear.map((gear) => (
                <GearCard
                  key={gear.id}
                  id={gear.id}
                  title={gear.name}
                  brand={gear.brand}
                  pricePerDay={Number(gear.pricePerDay)}
                  location="Local Area"
                  rating={4.5}
                  reviews={10}
                  isAvailable={gear.isAvailable && gear.availableQuantity > 0}
                  imageUrl={gear.images?.[0]}
                />
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-muted-foreground">
                No featured gear available at the moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trending this week */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                Trending this week <TrendingUp className="h-6 w-6 text-primary" />
              </h2>
              <p className="text-muted-foreground">What everyone is booking right now.</p>
            </div>
            <Link href="/gear?sortBy=pricePerDay&sortOrder=asc" className="hidden sm:flex text-sm font-semibold text-primary hover:underline items-center gap-1">
              View all trending <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border bg-card">
                  <Skeleton className="h-[200px] w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-8 w-1/4 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : trendingGear.length > 0 ? (
              trendingGear.map((gear) => (
                <GearCard
                  key={gear.id}
                  id={gear.id}
                  title={gear.name}
                  brand={gear.brand}
                  pricePerDay={Number(gear.pricePerDay)}
                  location="Local Area"
                  rating={4.5}
                  reviews={10}
                  isAvailable={gear.isAvailable && gear.availableQuantity > 0}
                  imageUrl={gear.images?.[0]}
                />
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-muted-foreground">
                No trending gear available at the moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-border/10">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-2">How it works</h2>
            <p className="text-muted-foreground">Three simple steps to your next adventure.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border/20 rounded-3xl p-8 hover:border-primary/30 transition-colors">
              <div className="bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Step 1</p>
              <h3 className="text-xl font-bold mb-3">Find your gear</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Filter by sport, brand, or distance to find precisely what you need for your trip.
              </p>
            </div>
            
            <div className="bg-card border border-border/20 rounded-3xl p-8 hover:border-primary/30 transition-colors">
              <div className="bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <Clock className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Step 2</p>
              <h3 className="text-xl font-bold mb-3">Book your dates</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select your dates, request to book, and await confirmation from the provider.
              </p>
            </div>

            <div className="bg-card border border-border/20 rounded-3xl p-8 hover:border-primary/30 transition-colors">
              <div className="bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Step 3</p>
              <h3 className="text-xl font-bold mb-3">Pick up & play</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Meet the provider at a convenient location, grab your gear, and hit the trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us & Stats */}
      <section className="py-24 bg-muted/20 border-y border-border/10">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold">Why choose GearUp</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            <div className="bg-card border border-border/20 rounded-2xl p-6">
              <Shield className="h-6 w-6 text-primary mb-4" />
              <h4 className="font-semibold mb-2">Secure & easy rentals</h4>
              <p className="text-xs text-muted-foreground">Damage protection and secure checkout on every booking.</p>
            </div>
            <div className="bg-card border border-border/20 rounded-2xl p-6">
              <Users className="h-6 w-6 text-primary mb-4" />
              <h4 className="font-semibold mb-2">Verified providers</h4>
              <p className="text-xs text-muted-foreground">All owners go through ID checks and community reviews.</p>
            </div>
            <div className="bg-card border border-border/20 rounded-2xl p-6">
              <Clock className="h-6 w-6 text-primary mb-4" />
              <h4 className="font-semibold mb-2">Flexible delivery</h4>
              <p className="text-xs text-muted-foreground">Local pickup or get it delivered to your home or hotel.</p>
            </div>
            <div className="bg-card border border-border/20 rounded-2xl p-6">
              <Star className="h-6 w-6 text-primary mb-4" />
              <h4 className="font-semibold mb-2">Compare and save</h4>
              <p className="text-xs text-muted-foreground">Save up to 60% compared to traditional rental shops.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-border/20 pt-16">
            <div>
              <h3 className="text-4xl md:text-5xl font-extrabold mb-2 text-foreground">10,734<span className="text-primary">+</span></h3>
              <p className="text-muted-foreground font-medium text-sm">Gear listed</p>
            </div>
            <div>
              <h3 className="text-4xl md:text-5xl font-extrabold mb-2 text-foreground">744</h3>
              <p className="text-muted-foreground font-medium text-sm">Verified providers</p>
            </div>
            <div>
              <h3 className="text-4xl md:text-5xl font-extrabold mb-2 text-foreground">81,308<span className="text-primary">+</span></h3>
              <p className="text-muted-foreground font-medium text-sm">Rentals completed</p>
            </div>
            <div>
              <h3 className="text-4xl md:text-5xl font-extrabold mb-2 text-foreground">4.2<span className="text-primary">/5</span></h3>
              <p className="text-muted-foreground font-medium text-sm">Average rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-accent rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&q=80&w=1200')] opacity-10 mix-blend-overlay bg-cover bg-center" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Your next adventure is one booking away</h2>
              <p className="text-lg text-white/90 mb-10">
                Join thousands of adventurers who trust GearUp for their outdoor equipment. Sign up today and get started.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 h-12 font-semibold">
                    Create free account
                  </Button>
                </Link>
                <Link href="/gear">
                  <Button size="lg" variant="outline" className="rounded-full bg-transparent border-white/30 text-white hover:bg-white/10 px-8 h-12 font-semibold">
                    Browse gear
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
