import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Cover placeholder */}
      <Skeleton className="h-64 w-full rounded-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex gap-12">
          <div className="flex-1 min-w-0 max-w-3xl mx-auto xl:mx-0">
            {/* Tags */}
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            {/* Title */}
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-4/5 mb-4" />

            {/* Subtitle */}
            <Skeleton className="h-6 w-3/4 mb-8" />

            {/* Author row */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>

            {/* Body paragraphs */}
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-4" style={{ width: `${70 + Math.random() * 30}%` }} />
              ))}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden xl:block w-56 shrink-0 space-y-3">
            <Skeleton className="h-4 w-24" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </aside>
        </div>
      </div>
    </main>
  );
}
