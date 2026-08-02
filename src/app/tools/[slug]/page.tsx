import { cache } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, Check, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toolDetailInclude, PUBLISHED } from "@/lib/queries";
import { siteConfig, absoluteUrl } from "@/lib/site-config";
import { stripHtml } from "@/lib/sanitize";
import { CategoryChip, PricingBadge } from "@/components/prompt/Badges";
import PromptCard from "@/components/prompt/PromptCard";
import RatingStars from "@/components/tool/RatingStars";
import AffiliateDisclosure from "@/components/tool/AffiliateDisclosure";

const getTool = cache(async (slug: string) => {
  return prisma.tool.findFirst({ where: { slug, ...PUBLISHED }, include: toolDetailInclude });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) return { title: "Tool not found" };

  const url = absoluteUrl(`/tools/${tool.slug}`);
  const description = (tool.metaDesc || stripHtml(tool.description)).slice(0, 155);

  return {
    title: tool.metaTitle || `${tool.name} review`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: `${tool.name} review`, description },
  };
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) notFound();

  const url = absoluteUrl(`/tools/${tool.slug}`);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      url,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      description: stripHtml(tool.description).slice(0, 300),
      ...(tool.logo ? { image: tool.logo } : {}),
      offers: {
        "@type": "Offer",
        price: tool.pricing === "FREE" ? "0" : undefined,
        priceCurrency: "USD",
        description: tool.priceNote ?? tool.pricing,
      },
      // aggregateRating is emitted only when a real rating exists. Inventing
      // one to win stars would violate Google's structured-data policy.
      ...(tool.rating != null
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: tool.rating,
              bestRating: 5,
              worstRating: 1,
              ratingCount: 1,
            },
          }
        : {}),
    },
    ...(tool.rating != null
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Review",
            itemReviewed: { "@type": "SoftwareApplication", name: tool.name, url },
            reviewRating: {
              "@type": "Rating",
              ratingValue: tool.rating,
              bestRating: 5,
              worstRating: 1,
            },
            author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
            datePublished: tool.publishedAt?.toISOString(),
          },
        ]
      : []),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
        { "@type": "ListItem", position: 3, name: tool.name, item: url },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <Link href="/tools" className="hover:text-foreground hover:underline">
            Tools
          </Link>
          <span className="mx-1.5">/</span>
          <span>{tool.name}</span>
        </nav>

        <AffiliateDisclosure className="mb-6" />

        <header className="card-framed mb-8 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {tool.logo ? (
              <Image
                src={tool.logo}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-sm border border-border object-contain"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border-2 border-ink bg-paper-cool font-display text-2xl font-bold text-ink">
                {tool.name.charAt(0)}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                {tool.name}
              </h1>
              <p className="mt-1 text-base text-muted-foreground">{tool.tagline}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PricingBadge value={tool.pricing} />
                {tool.category && (
                  <CategoryChip name={tool.category.name} chip={tool.category.chip} />
                )}
                {tool.rating != null && <RatingStars rating={tool.rating} />}
              </div>

              {tool.priceNote && (
                <p className="mt-2 text-xs text-muted-foreground">{tool.priceNote}</p>
              )}
            </div>

            <a
              href={`/go/${tool.slug}`}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border-2 border-ink bg-lime px-4 py-2.5 text-sm font-semibold text-ink shadow-[3px_3px_0_0_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-lime-deep hover:shadow-[2px_2px_0_0_var(--ink)]"
            >
              Visit {tool.name} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          {tool.bestFor && (
            <p className="mt-5 border-t border-border pt-4 text-sm text-foreground">
              <span className="font-semibold">Best for:</span> {tool.bestFor}
            </p>
          )}
        </header>

        {(tool.pros.length > 0 || tool.cons.length > 0) && (
          <section className="mb-8 grid gap-4 sm:grid-cols-2">
            {tool.pros.length > 0 && (
              <div className="rounded-md border border-border bg-paper-cool p-5">
                <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-foreground">
                  What&apos;s good
                </h2>
                <ul className="space-y-2">
                  {tool.pros.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      {/* green-text, not green: this glyph carries meaning at small size */}
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-text" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tool.cons.length > 0 && (
              <div className="rounded-md border border-border bg-paper-warm p-5">
                <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-foreground">
                  What&apos;s not
                </h2>
                <ul className="space-y-2">
                  {tool.cons.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <section className="mb-10">
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: tool.description }}
          />
        </section>

        {tool.prompts.length > 0 && (
          <section className="mb-10 border-t border-border pt-8">
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">
              Prompts for {tool.name}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tool.prompts.map(({ prompt }) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </section>
        )}

        {tool.articles.length > 0 && (
          <section className="border-t border-border pt-8">
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">
              Tutorials using {tool.name}
            </h2>
            <ul className="space-y-3">
              {tool.articles.map(({ article }) => (
                <li key={article.id}>
                  <Link
                    href={`/article/${article.slug}`}
                    className="block rounded-md border border-border bg-card p-4 transition-colors hover:border-ink"
                  >
                    <h3 className="font-display text-sm font-bold text-foreground">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {article.excerpt}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
