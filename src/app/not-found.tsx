import React from "react";
import Link from "next/link";
import { Feather, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16 text-center">
      {/* Large 404 with icon overlay */}
      <div className="relative mb-6 select-none">
        <span className="block text-[7rem] font-black leading-none tracking-tighter text-muted-foreground/15 sm:text-[9rem] lg:text-[11rem]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <Feather className="h-10 w-10 text-primary/40 sm:h-14 sm:w-14" />
        </div>
      </div>

      {/* Heading */}
      <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Page not found
      </h1>

      {/* Message */}
      <p className="mb-2 max-w-md text-base text-muted-foreground">
        Looks like this page flew away. The article or page you&apos;re looking
        for might have been moved, deleted, or never existed.
      </p>
      <p className="mb-8 text-sm text-muted-foreground">
        Double-check the URL, or head back home.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/feed">
            <BookOpen className="h-4 w-4" />
            Browse Articles
          </Link>
        </Button>
      </div>

      {/* Footer note */}
      <p className="mt-12 text-xs text-muted-foreground/50">
        Error 404 &mdash; The requested resource could not be found
      </p>
    </div>
  );
}
