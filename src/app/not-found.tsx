import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-[150px] font-bold text-primary/10 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-20 h-20 text-muted-foreground" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg">
            We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/gear">
              <Search className="w-4 h-4 mr-2" />
              Browse Gear
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-muted-foreground pt-8">
          If you believe this is an error, please contact our support team.
        </p>
      </div>
    </div>
  );
}
