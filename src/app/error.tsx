"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16 text-center">
      {/* Error icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      {/* Heading */}
      <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Something went wrong
      </h1>

      {/* Error details */}
      <p className="mb-2 max-w-md text-muted-foreground">
        {error.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "An unexpected error occurred. This has been logged and we'll look into it."}
      </p>

      {error.digest && (
        <p className="mb-6 text-xs text-muted-foreground/60">
          Error ID: {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button onClick={reset} className="gap-2" size="lg">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>

      {/* Help text */}
      <p className="mt-8 text-sm text-muted-foreground">
        If the problem persists,{" "}
        <Link
          href="/contact"
          className="text-primary underline-offset-2 hover:underline"
        >
          contact support
        </Link>
      </p>
    </div>
  );
}
