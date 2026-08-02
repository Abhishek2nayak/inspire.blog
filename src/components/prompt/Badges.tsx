import { cn } from "@/lib/utils";
import { chipClass } from "@/lib/categories";
import { getOutputTypeByValue } from "@/lib/prompts";

const base =
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-semibold leading-5";

/** Topic cluster chip. Spot colour as fill, paired foreground — never spot-as-text. */
export function CategoryChip({
  name,
  chip,
  className,
}: {
  name: string;
  chip?: string | null;
  className?: string;
}) {
  return <span className={cn(base, chipClass(chip), className)}>{name}</span>;
}

/** Which AI model the prompt targets. */
export function ModelBadge({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn(base, "border border-ink bg-transparent text-foreground", className)}>
      {name}
    </span>
  );
}

/** What the reader is making. */
export function OutputTypeBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const def = getOutputTypeByValue(value);
  if (!def) return null;
  return <span className={cn(base, chipClass(def.chip), className)}>{def.short}</span>;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export function DifficultyBadge({
  value,
  className,
}: {
  value: string | null;
  className?: string;
}) {
  if (!value) return null;
  return (
    <span className={cn(base, "bg-muted text-muted-foreground", className)}>
      {DIFFICULTY_LABEL[value] ?? value}
    </span>
  );
}

const PRICING_LABEL: Record<string, string> = {
  FREE: "Free",
  FREEMIUM: "Freemium",
  PAID: "Paid",
};

export function PricingBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  // Free reads as the positive case, so it gets the lime fill.
  const tone =
    value === "FREE"
      ? "bg-chip-lime text-chip-lime-fg"
      : value === "FREEMIUM"
        ? "bg-chip-yellow text-chip-yellow-fg"
        : "bg-ink text-bone";
  return <span className={cn(base, tone, className)}>{PRICING_LABEL[value] ?? value}</span>;
}
