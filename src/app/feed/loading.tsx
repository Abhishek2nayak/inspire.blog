import { Skeleton } from "@/components/ui/skeleton";

export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1272px] px-4 sm:px-6">
        <div className="flex gap-6 xl:gap-10 pt-8 pb-16">

          {/* Left nav skeleton */}
          <nav className="hidden lg:flex flex-col gap-1 w-56 shrink-0 pt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-xl" />
            ))}
          </nav>

          {/* Main feed skeleton */}
          <main className="flex-1 min-w-0">
            {/* Tab bar */}
            <div className="flex gap-3 border-b border-border pb-3 mb-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded" />
              ))}
            </div>

            {/* Article cards */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-6 border-b border-border">
                <div className="flex gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-4" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex items-center gap-4 pt-1">
                      <Skeleton className="h-3.5 w-16" />
                      <Skeleton className="h-3.5 w-10" />
                      <Skeleton className="h-3.5 w-10" />
                    </div>
                  </div>
                  <Skeleton className="hidden sm:block w-36 h-24 rounded-xl flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </main>

          {/* Right sidebar skeleton */}
          <aside className="hidden xl:flex flex-col gap-8 w-80 shrink-0 pt-1">
            <div className="space-y-5">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-36" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-full" />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-5 w-28" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-7 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
