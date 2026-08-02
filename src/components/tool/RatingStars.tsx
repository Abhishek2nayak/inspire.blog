import { cn } from "@/lib/utils";

/**
 * Yellow on bone is 1.28:1 — a plain yellow star is effectively invisible on
 * this background. So every star is drawn with a 1px ink stroke, which is
 * what makes the shape readable regardless of fill.
 */
function Star({ fill }: { fill: number }) {
  const id = `star-${Math.random().toString(36).slice(2, 9)}`;
  const pct = Math.round(Math.max(0, Math.min(1, fill)) * 100);
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${pct}%`} stopColor="var(--yellow)" />
          <stop offset={`${pct}%`} stopColor="transparent" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z"
        fill={`url(#${id})`}
        stroke="var(--ink)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RatingStars({
  rating,
  showValue = true,
  className,
}: {
  rating: number;
  showValue?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      aria-label={`Rated ${rating} out of 5`}
    >
      <span className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} fill={rating - i} />
        ))}
      </span>
      {showValue && (
        <span className="text-xs font-semibold text-foreground">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}
