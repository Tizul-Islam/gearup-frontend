"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-16 bg-background">
          <div className="bg-destructive/10 p-6 rounded-full mb-6">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            {this.state.error?.message || "An unexpected error occurred. Please try again."}
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Link href="/">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
