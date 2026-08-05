import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { promptCardInclude, PUBLISHED, JOIN } from "@/lib/queries";
import { OUTPUT_TYPES, getOutputType } from "@/lib/prompts";
import { siteConfig, absoluteUrl } from "@/lib/site-config";
import PromptCard from "@/components/prompt/PromptCard";

/**
 * Rendered on demand and cached, rather than prerendered at build.
 *
 * generateStaticParams was forcing every one of these pages to query the
 * database during `next build`. Against a scale-to-zero Neon instance that
 * made builds fail intermittently — the worst kind of failure. On-demand
 * rendering + revalidate keeps them cached and crawlable while removing the
 * build's dependency on the database entirely. Content updates also appear
 * without needing a rebuild.
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
 * stays independent of the database — the property the comment above was
 * protecting — while `dynamicParams` (true by default) renders each slug on
 * first request and then caches it for `revalidate`.
 */
export async function generateStaticParams() {
  return [];
}



export async function generateMetadata({
  params,
}: {
  params: Promise<{ output: string }>;
}): Promise<Metadata> {
  const { output } = await params;
  const def = getOutputType(output);
  if (!def) return { title: "Not found" };

  return {
    title: `AI prompts for ${def.name.toLowerCase()}`,
    description: def.description.slice(0, 155),
    alternates: { canonical: absoluteUrl(`/prompts/for/${def.slug}`) },
  };
}

export default async function OutputPillarPage({
  params,
}: {
  params: Promise<{ output: string }>;
}) {
  const { output } = await params;
  const def = getOutputType(output);
  if (!def) notFound();

  const prompts = await prisma.prompt.findMany({
    ...JOIN,
    where: { ...PUBLISHED, outputType: def.value },
    include: promptCardInclude,
    orderBy: [{ featured: "desc" }, { copies: "desc" }],
    take: 48,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `AI prompts for ${def.name}`,
    description: def.description,
    url: absoluteUrl(`/prompts/for/${def.slug}`),
    inLanguage: siteConfig.lang,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: prompts.length,
      itemListElement: prompts.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/prompts/${p.slug}`),
        name: p.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="grain border-b-2 border-ink bg-paper-warm">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
            <Link href="/prompts" className="hover:text-foreground hover:underline">
              Prompts
            </Link>
            <span className="mx-1.5">/</span>
            <span>{def.name}</span>
          </nav>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-green-text">
            {def.tagline}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            AI prompts for {def.name.toLowerCase()}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {def.description}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-sm border-2 border-ink bg-card px-3 py-1.5 font-mono text-xs font-semibold text-foreground">
            Usual ratio: {def.ratio}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {prompts.length === 0 ? (
          <div className="rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
            <p className="font-display text-lg font-bold text-foreground">
              No {def.short.toLowerCase()} prompts yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <Link href="/prompts" className="text-link hover:underline">
                Browse the full library
              </Link>{" "}
              in the meantime.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {prompts.length} prompt{prompts.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {prompts.map((p) => (
                <PromptCard key={p.id} prompt={p} featured={p.featured} />
              ))}
            </div>
          </>
        )}

        <section className="mt-12 border-t border-border pt-8">
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">
            Other things to make
          </h2>
          <div className="flex flex-wrap gap-2">
            {OUTPUT_TYPES.filter((o) => o.slug !== def.slug).map((o) => (
              <Link
                key={o.slug}
                href={`/prompts/for/${o.slug}`}
                className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-ink hover:text-foreground"
              >
                {o.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
