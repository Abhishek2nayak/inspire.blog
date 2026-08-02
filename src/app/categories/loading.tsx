import { PageHeroSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <>
      <PageHeroSkeleton tone="cool" />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card-framed space-y-3 p-6">
              <div className="skeleton-shimmer h-4 w-24 rounded-sm bg-muted" />
              <div className="skeleton-shimmer h-6 w-2/3 rounded-sm bg-muted" />
              <div className="skeleton-shimmer h-3 w-full rounded-sm bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
