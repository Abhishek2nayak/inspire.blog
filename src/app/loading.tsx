import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Masthead skeleton */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex gap-8 xl:gap-14">
          {/* Main feed */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Featured card */}
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <Skeleton className="h-3 w-12" />
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Article list */}
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="py-5 flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full hidden sm:block" />
                    <Skeleton className="h-3 w-2/3 hidden sm:block" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-24 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 space-y-6">
            <div className="rounded-2xl border border-border p-5 space-y-4">
              <Skeleton className="h-4 w-40" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-7 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border p-5 space-y-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>

            <div className="rounded-2xl border border-border p-5 space-y-3">
              <Skeleton className="h-4 w-36" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
