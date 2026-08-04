import Link from "next/link";
import { Tent } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Image/Branding */}
     <div className="hidden md:flex md:w-1/2 bg-muted relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
        <img
           src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=2070&auto=format&fit=crop"
          alt="Outdoor adventure"
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-primary/20 backdrop-blur-md p-2 rounded-xl">
            <Tent className="h-8 w-8 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            GearUp
          </span>
        </div>

        <div className="relative z-10 max-w-md mt-auto">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Start Your Next Great Adventure
          </h2>
          <p className="text-lg text-white/80">
            Join the community of outdoor enthusiasts. Rent top-quality gear from locals or share yours to earn extra income.
          </p>
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="flex-1 flex flex-col relative bg-background overflow-hidden">
        {/* Right side background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=2070&auto=format&fit=crop"
            alt="Auth Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>

        <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-4 z-10">
          <ThemeToggle />
          <Link
            href="/"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-border/50"
          >
            Back to Home
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
          <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
