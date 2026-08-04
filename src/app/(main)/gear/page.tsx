"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Filter,
  Search,
  Calendar,
  MapPin,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  SlidersHorizontal,
} from "lucide-react";
import { useGearList } from "@/hooks/use-gear";
import { useCategories } from "@/hooks/use-categories";
import { useDebounce } from "@/hooks/use-debounce";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GearCard } from "@/components/shared/gear-card";
import Image from "next/image";

function BrowseGearContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sortBy") || "createdAt";
  const currentOrder =
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentBrand = searchParams.get("brand") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentInStock = searchParams.get("isAvailable") === "true";

  const isClearingRef = React.useRef(false);

  // Local state
  const [searchTerm, setSearchTerm] = React.useState(currentSearch);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState([
    currentMinPrice ? parseInt(currentMinPrice) : 0,
    currentMaxPrice ? parseInt(currentMaxPrice) : 500,
  ]);
  const [brandTerm, setBrandTerm] = React.useState(currentBrand);

  const { data: categories } = useCategories();

  const {
    data: gearData,
    isLoading,
    isError,
    error,
  } = useGearList({
    search: debouncedSearch,
    category: currentCategory,
    sortBy: currentSort,
    sortOrder: currentOrder,
    page: currentPage,
    limit: 12,
    brand: currentBrand,
    minPrice: currentMinPrice ? parseInt(currentMinPrice) : undefined,
    maxPrice: currentMaxPrice ? parseInt(currentMaxPrice) : undefined,
    isAvailable: currentInStock ? "true" : undefined,
  });

  // Update URL on search change
  React.useEffect(() => {
    if (isClearingRef.current) return;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
      params.set("page", "1");
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch]);

  // Update URL on brand change
  React.useEffect(() => {
    if (isClearingRef.current) return;
    const params = new URLSearchParams(searchParams.toString());
    if (brandTerm) {
      params.set("brand", brandTerm);
      params.set("page", "1");
    } else {
      params.delete("brand");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [brandTerm]);

  // Update URL on price range change (debounced)
  React.useEffect(() => {
    if (isClearingRef.current) return;
    const params = new URLSearchParams(searchParams.toString());
    if (priceRange[0] > 0) {
      params.set("minPrice", String(priceRange[0]));
    } else {
      params.delete("minPrice");
    }
    if (priceRange[1] < 500) {
      params.set("maxPrice", String(priceRange[1]));
    } else {
      params.delete("maxPrice");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [priceRange]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    const [sortBy, sortOrder] = value.split("-");
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    isClearingRef.current = true;
    setSearchTerm("");
    setBrandTerm("");
    setPriceRange([0, 500]);
    router.push(pathname);
    setIsMobileFiltersOpen(false);
    
    // Allow React state and URL updates to settle before re-enabling effects
    setTimeout(() => {
      isClearingRef.current = false;
    }, 1000);
  };

  const renderSidebarContent = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {(currentCategory ||
          currentSearch ||
          currentBrand ||
          currentInStock) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs hover:bg-transparent hover:text-primary"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">Categories</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="cat-all"
              checked={!currentCategory}
              onCheckedChange={() => updateParam("category", "")}
              className="rounded-md border-border data-[state=checked]:bg-primary"
            />
              <Label
                htmlFor="cat-all"
                className="font-medium cursor-pointer text-sm flex-1 flex justify-between items-center"
              >
                <span>All Categories</span>
                <span className="text-muted-foreground text-xs bg-muted px-2 py-0.5 rounded-full">
                  {categories?.reduce((acc, cat) => acc + (cat._count?.gearItems || 0), 0) || 0}
                </span>
              </Label>
          </div>
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-3">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={currentCategory === cat.name}
                onCheckedChange={() => updateParam("category", cat.name)}
                className="rounded-md border-border data-[state=checked]:bg-primary"
              />
              <Label
                htmlFor={`cat-${cat.id}`}
                className="font-medium cursor-pointer text-sm flex-1 flex justify-between items-center"
              >
                <span>{cat.name}</span>
                <span className="text-muted-foreground text-xs bg-muted px-2 py-0.5 rounded-full">
                  {cat._count?.gearItems || 0}
                </span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <h4 className="font-semibold text-foreground">Brand</h4>
        <Input
          placeholder="Search brands..."
          value={brandTerm}
          onChange={(e) => setBrandTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Price Range Filter */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <h4 className="font-semibold text-foreground flex justify-between">
          Price Range{" "}
          <span className="text-primary font-bold">
            ${priceRange[0]} - ${priceRange[1]}
          </span>
        </h4>
        <Slider
          defaultValue={[0, 500]}
          max={500}
          step={5}
          value={priceRange}
          onValueChange={(val) => setPriceRange(val as number[])}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>$0</span>
          <span>$500+</span>
        </div>
      </div>

      {/* In Stock Only Filter */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="in-stock"
            checked={currentInStock}
            onCheckedChange={(checked) =>
              updateParam("isAvailable", checked ? "true" : "")
            }
            className="rounded-md border-border data-[state=checked]:bg-primary"
          />
          <Label
            htmlFor="in-stock"
            className="font-medium cursor-pointer text-sm"
          >
            In stock only
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Map Banner Section */}
      <div className="w-full h-[300px] relative bg-muted border-b border-border">
        <Image
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000"
          alt="Map view"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Button
            variant="secondary"
            className="rounded-full shadow-lg pointer-events-auto flex items-center gap-2"
          >
            <MapIcon className="h-4 w-4" /> View Map Search
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Filter Top Bar */}
        <div className="bg-card border border-border/40 rounded-full p-2 flex flex-col md:flex-row items-center justify-between gap-4 mb-10 shadow-sm relative -mt-16 z-10 mx-auto max-w-5xl">
          <div className="flex-1 flex items-center px-4 w-full md:w-auto">
            <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
            <Input
              placeholder="Search for gear..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 bg-transparent px-0 text-base shadow-none h-10 w-full"
            />
          </div>

          <div className="hidden md:block w-px h-8 bg-border" />

          <div className="flex-1 flex items-center px-4 w-full md:w-auto border-t md:border-t-0 border-border/40 pt-2 md:pt-0">
            <Calendar className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
            <div className="text-muted-foreground text-base w-full">
              Any dates
            </div>
          </div>

          <div className="hidden md:block w-px h-8 bg-border" />

          <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 px-2 md:px-0">
            <Select
              value={`${currentSort}-${currentOrder}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-full md:w-[160px] rounded-full border-0 bg-transparent shadow-none hover:bg-muted font-medium">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest</SelectItem>
                <SelectItem value="pricePerDay-asc">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="pricePerDay-desc">
                  Price: High to Low
                </SelectItem>
              </SelectContent>
            </Select>

            <Sheet
              open={isMobileFiltersOpen}
              onOpenChange={setIsMobileFiltersOpen}
            >
              <SheetTrigger
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "md:hidden rounded-full px-4 border-border/40 shrink-0",
                })}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
              {renderSidebarContent()}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Active Filters */}
            {(currentCategory ||
              searchTerm ||
              currentBrand ||
              currentInStock) && (
              <div className="flex flex-wrap gap-2 mb-8 items-center">
                <span className="text-sm font-medium text-muted-foreground mr-2">
                  Active filters:
                </span>
                {currentCategory && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 text-sm flex items-center gap-2 rounded-full border border-border bg-card"
                  >
                    {currentCategory}
                    <button type="button" className="cursor-pointer pointer-events-auto flex items-center justify-center rounded-full hover:bg-muted p-0.5" onClick={() => updateParam("category", "")}>
                      <X className="h-3 w-3 hover:text-primary transition-colors" />
                    </button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 text-sm flex items-center gap-2 rounded-full border border-border bg-card"
                  >
                    "{searchTerm}"
                    <button type="button" className="cursor-pointer pointer-events-auto flex items-center justify-center rounded-full hover:bg-muted p-0.5" onClick={() => setSearchTerm("")}>  
                      <X className="h-3 w-3 hover:text-primary transition-colors" />
                    </button>
                  </Badge>
                )}
                {currentBrand && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 text-sm flex items-center gap-2 rounded-full border border-border bg-card"
                  >
                    Brand: {currentBrand}
                    <button type="button" className="cursor-pointer pointer-events-auto flex items-center justify-center rounded-full hover:bg-muted p-0.5" onClick={() => setBrandTerm("")}>
                      <X className="h-3 w-3 hover:text-primary transition-colors" />
                    </button>
                  </Badge>
                )}
                {currentInStock && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 text-sm flex items-center gap-2 rounded-full border border-border bg-card"
                  >
                    In Stock Only
                    <button type="button" className="cursor-pointer pointer-events-auto flex items-center justify-center rounded-full hover:bg-muted p-0.5" onClick={() => updateParam("isAvailable", "")}>
                      <X className="h-3 w-3 hover:text-primary transition-colors" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            <div className="mb-6 flex justify-between items-end">
              <h2 className="text-2xl font-bold">
                {"Available Gear"}
                <span className="text-muted-foreground text-lg font-normal">
                  ({gearData?.meta?.total || 0})
                </span>
              </h2>
            </div>

            {/* Content Area */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden border border-border bg-card"
                  >
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
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-20 bg-destructive/10 rounded-xl border border-destructive/20">
                <p className="text-destructive font-medium text-lg">
                  Failed to load gear. {(error as any)?.message || "Please try again."}
                </p>
              </div>
            ) : !gearData?.data?.length ? (
              <div className="text-center py-32 bg-card rounded-2xl border border-border/50 flex flex-col items-center">
                <div className="bg-muted p-4 rounded-full mb-6">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No gear found</h3>
                <p className="text-muted-foreground max-w-md text-lg">
                  We couldn't find any items matching your current filters. Try
                  adjusting your search or clearing filters.
                </p>
                <Button
                  onClick={clearFilters}
                  variant="default"
                  className="mt-8 rounded-full px-8"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                  {gearData.data.map((gear) => (
                    <GearCard
                      key={gear.id}
                      id={gear.id}
                      title={gear.name}
                      brand={gear.category?.name || "Premium Gear"}
                      pricePerDay={gear.pricePerDay}
                      location="Local Area" // Placeholder since it's not in the API model by default
                      rating={4.8} // Placeholder
                      reviews={12} // Placeholder
                      isAvailable={gear.isAvailable}
                      imageUrl={gear.images?.[0]}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {gearData.meta.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-16 border-t border-border/20 pt-8">
                    <Button
                      variant="default"
                      className="rounded-full px-6 shadow-md"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        updateParam("page", String(currentPage - 1))
                      }
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="text-sm font-medium bg-muted px-4 py-2 rounded-full">
                      Page {currentPage} of {gearData.meta.totalPages}
                    </div>
                    <Button
                      variant="default"
                      className="rounded-full px-6 shadow-md"
                      disabled={currentPage >= gearData.meta.totalPages}
                      onClick={() =>
                        updateParam("page", String(currentPage + 1))
                      }
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function BrowseGearPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
            <p className="text-muted-foreground font-medium">Loading gear...</p>
          </div>
        </div>
      }
    >
      <BrowseGearContent />
    </Suspense>
  );
}
