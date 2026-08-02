import { PageHeroSkeleton, ArticleCardSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <>
      <PageHeroSkeleton tone="warm" />
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
        {Array.from({ length: 4 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
      </div>
    </>
  );
}
