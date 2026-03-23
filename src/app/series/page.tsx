"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, User, FileText } from "lucide-react";
import { getInitials, cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { SeriesWithPosts } from "@/types";

function SeriesCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="h-44 w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

function SeriesCard({ series }: { series: SeriesWithPosts }) {
  return (
    <Link href={`/series/${series.slug}`} className="group block">
      <article className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
        {/* Cover image */}
        {series.coverImage ? (
          <div className="relative h-44 overflow-hidden bg-muted">
            <img
              src={series.coverImage}
              alt={series.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex h-44 items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <BookOpen className="h-10 w-10 text-primary/40" />
          </div>
        )}

        <div className="p-5">
          <h2 className="mb-2 line-clamp-2 text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
            {series.title}
          </h2>

          {series.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
              {series.description}
            </p>
          )}

          {/* Meta: post count */}
          <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span>
              {series._count.posts} part{series._count.posts !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 border-t border-border pt-3">
            <Avatar className="h-7 w-7">
              {series.author.image && (
                <AvatarImage
                  src={series.author.image}
                  alt={series.author.name || "Author"}
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {getInitials(series.author.name || "A")}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-muted-foreground truncate">
              {series.author.name}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<SeriesWithPosts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await fetch("/api/series");
        if (!res.ok) throw new Error("Failed to fetch series");
        const data = await res.json();
        setSeriesList(data.series || data || []);
      } catch {
        setError("Failed to load series");
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Series
        </h1>
        <p className="mt-2 text-muted-foreground">
          Curated collections of articles on a single topic
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SeriesCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/30 py-16 text-center">
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && seriesList.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/30 py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-5">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            No series yet
          </h2>
          <p className="mb-4 text-sm text-muted-foreground max-w-xs">
            Series are collections of related articles. Start writing to create your first series.
          </p>
          <Link
            href="/editor/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start Writing
          </Link>
        </div>
      )}

      {/* Series grid */}
      {!loading && !error && seriesList.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {seriesList.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      )}
    </div>
  );
}
