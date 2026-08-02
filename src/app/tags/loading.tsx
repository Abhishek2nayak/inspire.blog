import { PageHeroSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <>
      <PageHeroSkeleton tone="cool" />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-8 w-24 rounded-sm bg-muted" />
          ))}
        </div>
      </div>
    </>
  );
}
