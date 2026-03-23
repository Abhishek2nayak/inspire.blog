import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ArticleCardSkeletonProps {
  className?: string;
}

export default function ArticleCardSkeleton({ className }: ArticleCardSkeletonProps) {
  return (
    <div className={cn("py-6 border-b border-border", className)}>
      <div className="flex gap-6">
        {/* Content */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Title */}
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />

          {/* Excerpt */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />

          {/* Footer row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <Skeleton className="hidden sm:block w-28 h-28 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}
