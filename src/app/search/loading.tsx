import { GridSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="skeleton-shimmer h-9 w-40 rounded-sm bg-muted" />
      <div className="skeleton-shimmer mt-5 h-11 w-full max-w-xl rounded-md bg-muted" />
      <div className="mt-10">
        <GridSkeleton count={6} />
      </div>
    </div>
  );
}
