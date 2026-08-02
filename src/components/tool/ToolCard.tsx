import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingBadge } from "@/components/prompt/Badges";
import RatingStars from "./RatingStars";
import type { ToolCard as ToolCardData } from "@/lib/queries";

export default function ToolCard({
  tool,
  featured = false,
  className,
}: {
  tool: ToolCardData;
  featured?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 p-5 transition-transform",
        featured
          ? "card-framed hover:-translate-y-0.5"
          : "rounded-md border border-border bg-card hover:border-ink",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {tool.logo ? (
          <Image
            src={tool.logo}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-sm border border-border object-contain"
          />
        ) : (
          // Monogram fallback keeps the row aligned when a logo is missing.
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 border-ink bg-paper-cool font-display text-lg font-bold text-ink">
            {tool.name.charAt(0)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold leading-tight text-foreground">
            <Link href={`/tools/${tool.slug}`} className="hover:underline">
              {tool.name}
            </Link>
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {tool.tagline}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PricingBadge value={tool.pricing} />
        {tool.rating != null && <RatingStars rating={tool.rating} />}
      </div>

      {tool.priceNote && (
        <p className="text-xs text-muted-foreground">{tool.priceNote}</p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-1">
        <Link
          href={`/tools/${tool.slug}`}
          className="flex-1 rounded-md border border-ink px-3 py-1.5 text-center text-xs font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Read review
        </Link>
        <a
          href={`/go/${tool.slug}`}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="inline-flex items-center gap-1 rounded-md border-2 border-ink bg-lime px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-lime-deep"
        >
          Visit <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
}
