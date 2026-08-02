export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="skeleton-shimmer h-3 w-32 rounded-sm bg-muted" />
      <div className="skeleton-shimmer mt-6 h-12 w-full rounded-md bg-muted" />
      <div className="card-framed mt-6 p-6">
        <div className="flex gap-4">
          <div className="skeleton-shimmer h-16 w-16 shrink-0 rounded-sm bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-shimmer h-8 w-1/2 rounded-sm bg-muted" />
            <div className="skeleton-shimmer h-4 w-3/4 rounded-sm bg-muted" />
            <div className="skeleton-shimmer h-5 w-24 rounded-sm bg-muted" />
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="skeleton-shimmer h-40 rounded-md bg-muted" />
        <div className="skeleton-shimmer h-40 rounded-md bg-muted" />
      </div>
    </div>
  );
}
