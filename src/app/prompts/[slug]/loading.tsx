export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="skeleton-shimmer h-3 w-40 rounded-sm bg-muted" />
      <div className="mt-6 flex gap-1.5">
        <div className="skeleton-shimmer h-5 w-20 rounded-sm bg-muted" />
        <div className="skeleton-shimmer h-5 w-24 rounded-sm bg-muted" />
      </div>
      <div className="skeleton-shimmer mt-3 h-10 w-3/4 rounded-sm bg-muted" />
      <div className="skeleton-shimmer mt-3 h-4 w-full max-w-2xl rounded-sm bg-muted" />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="skeleton-shimmer aspect-[4/3] rounded-md bg-muted" />
        <div className="skeleton-shimmer aspect-[4/3] rounded-md bg-muted" />
      </div>

      <div className="skeleton-shimmer mt-8 h-6 w-32 rounded-sm bg-muted" />
      <div className="mt-3 rounded-md border-2 border-ink bg-paper-cool">
        <div className="space-y-2 p-5">
          <div className="skeleton-shimmer h-3 w-full rounded-sm bg-muted" />
          <div className="skeleton-shimmer h-3 w-full rounded-sm bg-muted" />
          <div className="skeleton-shimmer h-3 w-2/3 rounded-sm bg-muted" />
        </div>
        <div className="flex justify-end border-t-2 border-ink px-3 py-2">
          <div className="skeleton-shimmer h-7 w-28 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
