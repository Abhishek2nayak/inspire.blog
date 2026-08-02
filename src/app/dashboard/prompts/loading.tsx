export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="skeleton-shimmer h-8 w-48 rounded-sm bg-muted" />
      <div className="skeleton-shimmer h-4 w-64 rounded-sm bg-muted" />
      <div className="space-y-3 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-14 w-full rounded-md bg-muted" />
        ))}
      </div>
    </div>
  );
}
