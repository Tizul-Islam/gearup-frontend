import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "About GearUp — Our Mission",
  description: "Why we built a rental marketplace for sports and outdoor equipment.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">About</span>
        </nav>

        {/* Page Header */}
        <div className="mb-10">
          <p className="text-sm font-medium text-primary mb-2">Our story</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Gear should be used, not stored
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            GearUp connects adventurers with local providers so great equipment spends more time outside and less time in garages.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-muted-foreground mb-12">
          <p className="text-base">
            We started GearUp in 2023 after a season of borrowed tents and rented bikes taught us how much
            perfectly good equipment sits unused. Today more than 860 verified providers list on the platform
            across 40+ European cities.
          </p>
          <p className="text-base">
            Every item is inspected between rentals, every booking is insured up to €5,000, and every provider is
            ID-verified before their first listing goes live.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { k: "12,400+", v: "Items listed" },
            { k: "94,000+", v: "Rentals completed" },
            { k: "4.9/5", v: "Average rating" },
          ].map((s) => (
            <Card key={s.v} className="border bg-card shadow-sm">
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {s.k}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{s.v}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
