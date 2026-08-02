import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

interface LogoProps {
  className?: string;
  /** text size — default is "md" */
  size?: "sm" | "md" | "lg";
  /** whether to wrap in a Link to "/" */
  asLink?: boolean;
}

const sizeMap = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
} as const;

const boxMap = {
  sm: "px-1 border-[1.5px] shadow-[1.5px_1.5px_0_0_var(--ink)]",
  md: "px-1.5 border-2 shadow-[2px_2px_0_0_var(--ink)]",
  lg: "px-2 border-2 shadow-[3px_3px_0_0_var(--ink)]",
} as const;

/**
 * The wordmark literalises the name: "frame" sits inside an actual frame,
 * rendered with the same ink-border + hard-offset treatment used by
 * `card-framed` elsewhere. Lime is a fill here, never text — ink on lime
 * is 7.67:1.
 */
function LogoMark({ size = "md", className }: LogoProps) {
  return (
    <span
      className={cn(
        "font-display font-bold tracking-tight select-none leading-none",
        "inline-flex items-baseline gap-[0.15em]",
        sizeMap[size],
        className
      )}
      aria-label={siteConfig.name}
    >
      <span className="text-foreground">Make</span>
      <span
        className={cn(
          "inline-block rounded-sm border-ink bg-lime text-ink",
          "py-[0.06em]",
          boxMap[size]
        )}
      >
        frame
      </span>
    </span>
  );
}

export default function Logo({ size = "md", className, asLink = true }: LogoProps) {
  if (!asLink) return <LogoMark size={size} className={className} />;
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn(
        "inline-flex items-center transition-transform hover:-translate-y-px",
        className
      )}
    >
      <LogoMark size={size} />
    </Link>
  );
}
