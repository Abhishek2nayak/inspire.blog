import { cache } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { promptDetailInclude, promptCardInclude, PUBLISHED, JOIN } from "@/lib/queries";
import { siteConfig, absoluteUrl } from "@/lib/site-config";
import { getOutputTypeByValue } from "@/lib/prompts";
import { formatNumber } from "@/lib/utils";
import {
  resolvePromptAccess,
  isPaid,
  teaser,
  formatPrice,
  buildFullPrompt,
} from "@/lib/prompt-access";
import CopyBlock from "@/components/prompt/CopyBlock";
import CopyEverything from "@/components/prompt/CopyEverything";
import LockedPrompt from "@/components/prompt/LockedPrompt";
import SaveButton from "@/components/shared/SaveButton";
import PromptCard from "@/components/prompt/PromptCard";
import {
  CategoryChip,
  DifficultyBadge,
  ModelBadge,
  OutputTypeBadge,
  PricingBadge,
} from "@/components/prompt/Badges";

/**
 * Cached for an hour; busted immediately on publish/edit by the
 * revalidatePrompts() call in the admin write routes (src/api/revalidate.ts).
 *
 * Access control still works under caching: the paid-prompt body is stripped
 * by resolvePromptAccess *below* this cache, per request. Only the published,
 * non-secret shell is shared between visitors.
 */
export const revalidate = 3600;

/**
 * Opts this route into ISR without prerendering anything at build time.
 *
 * WHY THE EMPTY ARRAY: `export const revalidate` alone does nothing on a
 * dynamic segment — without generateStaticParams Next treats the route as
 * fully dynamic and never writes it to the ISR cache (verify with
 * `dynamicRoutes` in .next/prerender-manifest.json, which was empty before
 * this). Returning [] generates no pages during `next build`, so the deploy
 * stays independent of the database, while `dynamicParams` (true by default)
 * renders each slug on first request and then caches it for `revalidate`.
 */
export async function generateStaticParams() {
  return [];
}


/** Shared by generateMetadata and the page so both hit the DB once. */
const getPrompt = cache(async (slug: string) => {
  return prisma.prompt.findFirst({
    ...JOIN,
    where: { slug, ...PUBLISHED },
    include: promptDetailInclude,
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await getPrompt(slug);
  if (!prompt) return { title: "Prompt not found" };

  const url = absoluteUrl(`/prompts/${prompt.slug}`);
  // Deliberately does NOT fall back to prompt.body: for a paid prompt that
  // would publish the thing being sold straight into the meta description.
  const description = (
    prompt.metaDesc ||
    prompt.description ||
    `A ${prompt.kind.toLowerCase()} prompt for ${prompt.title}.`
  ).slice(0, 155);
  const image = prompt.examples.find((e) => !e.isVideo)?.url;

  return {
    title: prompt.metaTitle || prompt.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: prompt.title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: prompt.title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prompt = await getPrompt(slug);
  if (!prompt) notFound();

  const output = getOutputTypeByValue(prompt.outputType);
  const access = await resolvePromptAccess(prompt);
  const paid = isPaid(prompt);

  // "Copy everything" only earns its place when there is more than one piece
  // to stitch together — otherwise it just duplicates the button below it.
  const bundled = [
    "prompt",
    prompt.negative ? "negative" : null,
    prompt.parameters ? "parameters" : null,
  ].filter(Boolean) as string[];
  const showCopyAll = access.unlocked && bundled.length > 1;

  const related = await prisma.prompt.findMany({
    ...JOIN,
    where: {
      ...PUBLISHED,
      id: { not: prompt.id },
      OR: [{ outputType: prompt.outputType }, { modelId: prompt.modelId ?? undefined }],
    },
    include: promptCardInclude,
    orderBy: { copies: "desc" },
    take: 3,
  });

  const url = absoluteUrl(`/prompts/${prompt.slug}`);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: prompt.title,
      url,
      description: prompt.description ?? undefined,
      // Never expose a locked body here — JSON-LD is plain text in the HTML.
      ...(access.unlocked ? { text: prompt.body } : {}),
      inLanguage: siteConfig.lang,
      isAccessibleForFree: !paid,
      ...(paid
        ? {
            offers: {
              "@type": "Offer",
              price: (prompt.priceCents / 100).toFixed(2),
              priceCurrency: prompt.currency,
              availability: "https://schema.org/InStock",
            },
          }
        : {}),
      datePublished: prompt.publishedAt?.toISOString(),
      dateModified: prompt.updatedAt.toISOString(),
      author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
      keywords: prompt.tags.map((t) => t.tag.name).join(", "),
      ...(prompt.examples.length > 0
        ? {
            associatedMedia: prompt.examples.map((e) =>
              e.isVideo
                ? {
                    "@type": "VideoObject",
                    contentUrl: e.url,
                    name: e.alt || prompt.title,
                    description: e.caption || prompt.description || prompt.title,
                    uploadDate: prompt.publishedAt?.toISOString(),
                  }
                : {
                    "@type": "ImageObject",
                    contentUrl: e.url,
                    caption: e.caption || e.alt || prompt.title,
                    ...(e.width ? { width: e.width } : {}),
                    ...(e.height ? { height: e.height } : {}),
                  }
            ),
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Prompts", item: absoluteUrl("/prompts") },
        ...(output
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: output.name,
                item: absoluteUrl(`/prompts/for/${output.slug}`),
              },
            ]
          : []),
        { "@type": "ListItem", position: output ? 4 : 3, name: prompt.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <Link href="/prompts" className="hover:text-foreground hover:underline">
            Prompts
          </Link>
          {output && (
            <>
              <span className="mx-1.5">/</span>
              <Link
                href={`/prompts/for/${output.slug}`}
                className="hover:text-foreground hover:underline"
              >
                {output.name}
              </Link>
            </>
          )}
        </nav>

        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <OutputTypeBadge value={prompt.outputType} />
            {prompt.model && <ModelBadge name={prompt.model.name} />}
            <DifficultyBadge value={prompt.difficulty} />
            {prompt.category && (
              <CategoryChip name={prompt.category.name} chip={prompt.category.chip} />
            )}
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            {prompt.title}
          </h1>

          {prompt.description && (
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {prompt.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={
                paid
                  ? "rounded-sm border-2 border-ink bg-lime px-2.5 py-1 font-display text-base font-bold text-ink"
                  : "rounded-sm bg-chip-green px-2 py-0.5 text-[11px] font-semibold text-chip-green-fg"
              }
            >
              {formatPrice(prompt.priceCents, prompt.currency)}
            </span>
            <p className="text-xs text-muted-foreground">
              {formatNumber(prompt.copies)} copies
              {prompt.aspectRatio && <> · {prompt.aspectRatio}</>}
            </p>
            <SaveButton kind="PROMPT" id={prompt.id} />
          </div>
        </header>

        {prompt.examples.length > 0 && (
          <section className="mb-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {prompt.examples.map((e) => (
                <figure key={e.id} className="card-framed overflow-hidden">
                  <div className="relative aspect-[4/3] bg-muted">
                    {e.isVideo ? (
                      <video
                        src={e.url}
                        controls
                        muted
                        loop
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={e.url}
                        alt={e.alt || prompt.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  {e.caption && (
                    <figcaption className="border-t-2 border-ink px-3 py-2 text-xs text-muted-foreground">
                      {e.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="mb-3 font-display text-lg font-bold text-foreground">The prompt</h2>
          {showCopyAll && (
            <CopyEverything
              className="mb-3"
              text={buildFullPrompt(prompt)}
              promptId={prompt.id}
              includes={bundled}
            />
          )}

          {access.unlocked ? (
            <CopyBlock text={prompt.body} promptId={prompt.id} label="Copy prompt only" />
          ) : (
            <LockedPrompt
              promptId={prompt.id}
              teaser={teaser(prompt.body)}
              priceLabel={formatPrice(prompt.priceCents, prompt.currency)}
              charCount={prompt.body.length}
            />
          )}

          {prompt.parameters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Parameters
              </span>
              <code className="rounded-sm border border-border bg-muted px-2 py-1 font-mono text-xs text-foreground">
                {prompt.parameters}
              </code>
            </div>
          )}

          {prompt.negative && access.unlocked && (
            <div className="mt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Negative prompt
              </h3>
              <CopyBlock text={prompt.negative} label="Copy negative" compact />
            </div>
          )}
        </section>

        {prompt.variations.length > 0 && access.unlocked && (
          <section className="mb-8">
            <h2 className="mb-3 font-display text-lg font-bold text-foreground">Variations</h2>
            <div className="space-y-4">
              {prompt.variations.map((v) => (
                <div key={v.id}>
                  <h3 className="mb-1.5 text-sm font-semibold text-foreground">{v.label}</h3>
                  <CopyBlock text={v.body} promptId={prompt.id} label="Copy" compact />
                </div>
              ))}
            </div>
          </section>
        )}

        {prompt.tips && (
          <section className="mb-8">
            <div className="rounded-md border-l-4 border-ink bg-paper-warm p-5">
              <h2 className="mb-2 inline-flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <Lightbulb className="h-4 w-4" />
                How to get the most from it
              </h2>
              <div
                className="article-content text-sm"
                dangerouslySetInnerHTML={{ __html: prompt.tips }}
              />
            </div>
          </section>
        )}

        {prompt.tools.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-display text-lg font-bold text-foreground">
              Tools that run this
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {prompt.tools.map(({ tool }) => (
                <div
                  key={tool.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border bg-card p-4"
                >
                  <div>
                    <h3 className="font-display text-sm font-bold text-foreground">
                      <Link href={`/tools/${tool.slug}`} className="hover:underline">
                        {tool.name}
                      </Link>
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{tool.tagline}</p>
                    <div className="mt-2">
                      <PricingBadge value={tool.pricing} />
                    </div>
                  </div>
                  <a
                    href={`/go/${tool.slug}`}
                    rel="sponsored nofollow noopener"
                    target="_blank"
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border-2 border-ink bg-lime px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-lime-deep"
                  >
                    Visit <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {prompt.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-1.5">
            {prompt.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-ink hover:text-foreground"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <section className="border-t border-border pt-8">
            <h2 className="mb-4 font-display text-lg font-bold text-foreground">
              More like this
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PromptCard key={p.id} prompt={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
