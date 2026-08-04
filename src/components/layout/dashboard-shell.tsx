import React from "react";
import { cn } from "@/lib/utils";

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  role?: "customer" | "provider" | "admin"; // Optional, for future specific styling
  children?: React.ReactNode;
}

export function DashboardShell({
  title,
  description,
  role,
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div className={cn("flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6", className)} {...props}>
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-1 text-base">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
