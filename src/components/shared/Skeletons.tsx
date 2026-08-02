import { cn } from "@/lib/utils";

/**
 * Loading placeholders.
 *
 * These exist because the App Router will not navigate until the server
 * component finishes — without a loading.tsx the click appears to do nothing,
 * which is what read as "laggy". A loading.tsx makes Next stream the shell
 * immediately and swap in the content when it arrives.
 *
 * Shapes deliberately mirror the real cards so the swap doesn't jump.
 */

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-sm bg-muted", className)} />;
}

export function PromptCardSkeleton({ framed = false }: { framed?: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden",
        framed ? "card-framed" : "rounded-md border border-border bg-card"
      )}
    >
      <Shimmer className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <div className="flex gap-1.5">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-4 w-20" />
        </div>
        <Shimmer className="h-5 w-4/5" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function ToolCardSkeleton() {
  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-5">
      <div className="flex gap-3">
        <Shimmer className="h-10 w-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-1/2" />
          <Shimmer className="h-3 w-full" />
        </div>
      </div>
      <Shimmer className="h-4 w-20" />
      <div className="flex gap-2 pt-1">
        <Shimmer className="h-8 flex-1" />
        <Shimmer className="h-8 w-20" />
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-md border border-border bg-card p-4">
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-5 w-3/4" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-32" />
      </div>
      <Shimmer className="hidden h-24 w-32 shrink-0 sm:block" />
    </div>
  );
}

/** Coloured band + heading that every index page opens with. */
export function PageHeroSkeleton({ tone = "warm" }: { tone?: "warm" | "cool" }) {
  return (
    <section
      className={cn(
        "border-b-2 border-ink",
        tone === "warm" ? "bg-paper-warm" : "bg-paper-cool"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <Shimmer className="h-10 w-2/3 max-w-md sm:h-12" />
        <Shimmer className="mt-4 h-4 w-full max-w-xl" />
        <Shimmer className="mt-2 h-4 w-1/2 max-w-sm" />
      </div>
    </section>
  );
}

export function GridSkeleton({
  count = 6,
  variant = "prompt",
}: {
  count?: number;
  variant?: "prompt" | "tool";
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) =>
        variant === "tool" ? <ToolCardSkeleton key={i} /> : <PromptCardSkeleton key={i} />
      )}
    </div>
  );
}
