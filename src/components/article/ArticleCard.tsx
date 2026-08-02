import Link from "next/link";
import Image from "next/image";
import { Clock, MessageSquare } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { CategoryChip, DifficultyBadge } from "@/components/prompt/Badges";
import type { ArticleCardData } from "@/lib/queries";

const KIND_LABEL: Record<string, string> = {
  TUTORIAL: "Tutorial",
  GUIDE: "Guide",
  COMPARISON: "Comparison",
  ROUNDUP: "Roundup",
  NEWS: "News",
};

export default function ArticleCard({
  article,
  featured = false,
  className,
}: {
  article: ArticleCardData;
  featured?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group flex gap-4 p-4 transition-colors sm:gap-5",
        featured ? "card-framed" : "rounded-md border border-border bg-card hover:border-ink",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-sm border border-ink px-1.5 py-0.5 text-[11px] font-semibold leading-5 text-foreground">
            {KIND_LABEL[article.kind] ?? article.kind}
          </span>
          {article.category && (
            <CategoryChip name={article.category.name} chip={article.category.chip} />
          )}
          <DifficultyBadge value={article.difficulty} />
        </div>

        <h3 className="font-display text-lg font-bold leading-snug text-foreground">
          <Link href={`/article/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime} min
          </span>
          {article._count.comments > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {article._count.comments}
            </span>
          )}
        </div>
      </div>

      {article.coverImage && (
        <Link
          href={`/article/${article.slug}`}
          className="relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-sm border border-border sm:block"
        >
          <Image
            src={article.coverImage}
            alt={article.coverAlt || ""}
            fill
            sizes="128px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}
    </article>
  );
}
