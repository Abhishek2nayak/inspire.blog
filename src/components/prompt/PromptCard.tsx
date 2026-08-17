import Link from "next/link";
import Image from "next/image";
import { Copy, Heart } from "lucide-react";
import { Lock } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { formatPrice } from "@/lib/prompt-access";
import { chipClass } from "@/lib/categories";
import { getOutputTypeByValue } from "@/lib/prompts";
import { ModelBadge, OutputTypeBadge } from "./Badges";
import type { PromptCard as PromptCardData } from "@/lib/queries";

/**
 * A prompt's example image has to be the real output of running it, which
 * means new prompts legitimately have none until someone generates one.
 * Rather than a broken-image gap, those render a typographic panel showing
 * the prompt text itself on the output type's spot colour — which reads as
 * deliberate and stays useful.
 */
function Fallback({ body, chip }: { body: string; chip: string }) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden", chipClass(chip))}>
      {/* opacity-85 rather than 70: on the dark-green chip the paired
          foreground is white, and fading it further made the text unreadable. */}
      <p className="absolute inset-0 p-4 font-mono text-[10px] leading-snug opacity-85">
        {body.slice(0, 320)}
      </p>
      {/* Fades the text out at the bottom so it reads as a texture, not a
          truncated paragraph. Uses the chip's own colour, not black, so it
          works on both light and dark spot fills. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-current to-transparent opacity-90" />
    </div>
  );
}

export default function PromptCard({
  prompt,
  featured = false,
  className,
}: {
  prompt: PromptCardData;
  featured?: boolean;
  className?: string;
}) {
  const example = prompt.examples[0];
  const output = getOutputTypeByValue(prompt.outputType);
  const chip = output?.chip ?? prompt.category?.chip ?? "lime";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden transition-transform",
        // Framed treatment is reserved for featured cards — if every card is
        // framed the effect stops meaning anything.
        featured
          ? "card-framed hover:-translate-y-0.5"
          : "rounded-md border border-border bg-card hover:border-ink",
        className
      )}
    >
      <Link
        href={`/prompts/${prompt.slug}`}
        className="relative block aspect-[4/4] overflow-hidden border-b border-border bg-muted"
      >
        {example ? (
          example.isVideo ? (
            <video
              src={example.url}
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={example.url}
              alt={example.alt || prompt.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )
        ) : (
          <Fallback body={prompt.body} chip={chip} />
        )}

        {prompt.aspectRatio && (
          <span className="absolute right-2 top-2 rounded-sm border border-ink bg-bone/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink">
            {prompt.aspectRatio}
          </span>
        )}

        {/* Price sits on the image so it is legible before any text loads. */}
        <span
          className={cn(
            "absolute left-2 top-2 inline-flex items-center gap-1 rounded-sm border-2 border-ink px-1.5 py-0.5 text-[11px] font-bold",
            prompt.priceCents > 0 ? "bg-lime text-ink" : "bg-bone/90 text-ink"
          )}
        >
          {prompt.priceCents > 0 && <Lock className="h-2.5 w-2.5" />}
          {formatPrice(prompt.priceCents, prompt.currency)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <OutputTypeBadge value={prompt.outputType} />
          {prompt.model && <ModelBadge name={prompt.model.name} />}
        </div>

        <h3 className="font-display text-base font-bold leading-snug text-foreground">
          <Link href={`/prompts/${prompt.slug}`} className="hover:underline">
            {prompt.title}
          </Link>
        </h3>

        {prompt.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {prompt.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Copy className="h-3 w-3" />
            {formatNumber(prompt.copies)} copies
          </span>
          {prompt.likeCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatNumber(prompt.likeCount)}
            </span>
          )}
          {prompt.sales > 0 && <span>{formatNumber(prompt.sales)} sold</span>}
        </div>
      </div>
    </article>
  );
}
