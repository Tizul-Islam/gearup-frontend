"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Search, Bell, User, LogOut, LayoutDashboard } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { useAuth, getDashboardPath } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "./notification-bell";

const NAV_LINKS = [
  { name: "Browse gear", href: "/gear" },
  { name: "Categories", href: "/categories" },
  { name: "About", href: "/about" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [isMounted, setIsMounted] = React.useState(false);
  const { user, logout, isLoading } = useAuth();

  React.useEffect(() => {
    setIsMounted(true);
  }, [pathname]);

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
  };

  const getDashboardLink = () => getDashboardPath(user?.role ?? null);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-full flex items-center justify-center h-8 w-8">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white h-4 w-4"
                >
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                GearUp
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/20">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors px-4 py-1.5 rounded-full",
                    pathname === link.href
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <Search className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            
            {isMounted && user ? (
              <>
                <NotificationBell />
                <div className="flex items-center gap-3 ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="relative h-8 w-8 rounded-full ml-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:opacity-80 transition-opacity bg-transparent border-0 p-0 flex items-center justify-center cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-2 py-1.5 text-sm">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} variant="destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-muted/50 border border-border/50"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "rounded-full bg-primary text-white hover:bg-primary/90 px-5",
                  )}
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border animate-in slide-in-from-top-2">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-border flex flex-col gap-3">
              {isMounted && user ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    className={buttonVariants({
                      variant: "outline",
                      className: "w-full rounded-full",
                    })}
                  >
                    Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full rounded-full text-destructive"
                    onClick={handleLogout}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={buttonVariants({
                      variant: "outline",
                      className: "w-full rounded-full",
                    })}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({}),
                      "w-full rounded-full bg-primary text-white",
                    )}
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
