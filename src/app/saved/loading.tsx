import { GridSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="skeleton-shimmer h-9 w-32 rounded-sm bg-muted" />
      <div className="mt-8">
        <GridSkeleton count={3} />
      </div>
    </div>
  );
}
