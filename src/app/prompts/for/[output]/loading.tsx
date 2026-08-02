import { PageHeroSkeleton, GridSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <>
      <PageHeroSkeleton tone="warm" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <GridSkeleton count={6} />
      </div>
    </>
  );
}
