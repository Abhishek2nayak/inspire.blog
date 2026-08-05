import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  promptCardInclude,
  toolCardInclude,
  articleCardInclude,
  PUBLISHED,
  JOIN,
} from "@/lib/queries";
import { CLUSTERS, getCluster, chipClass } from "@/lib/categories";
import { siteConfig, absoluteUrl } from "@/lib/site-config";
import PromptCard from "@/components/prompt/PromptCard";
import ToolCard from "@/components/tool/ToolCard";
import ArticleCard from "@/components/article/ArticleCard";

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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cluster = getCluster(slug);
  if (!cluster) return { title: "Topic not found" };

  return {
    title: cluster.name,
    description: cluster.description.slice(0, 155),
    alternates: { canonical: absoluteUrl(`/category/${cluster.slug}`) },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // CLUSTERS is the source of truth, so a pillar page renders even before the
  // Category row exists or has any content. Previously this 404'd until the
  // seed had run, which silently broke every topic link.
  const cluster = getCluster(slug);
  if (!cluster) notFound();

  const category = await prisma.category.findUnique({ where: { slug } });

  const [prompts, tools, articles] = category
    ? await Promise.all([
        prisma.prompt.findMany({
          ...JOIN,
          where: { ...PUBLISHED, categoryId: category.id },
          include: promptCardInclude,
          orderBy: [{ featured: "desc" }, { copies: "desc" }],
          take: 6,
        }),
        prisma.tool.findMany({
          ...JOIN,
          where: { ...PUBLISHED, categoryId: category.id },
          include: toolCardInclude,
          orderBy: [{ featured: "desc" }, { name: "asc" }],
          take: 6,
        }),
        prisma.article.findMany({
          ...JOIN,
          where: { ...PUBLISHED, categoryId: category.id },
          include: articleCardInclude,
          orderBy: { publishedAt: "desc" },
          take: 6,
        }),
      ])
    : [[], [], []];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cluster.name} | ${siteConfig.name}`,
    description: cluster.description,
    url: absoluteUrl(`/category/${cluster.slug}`),
    inLanguage: siteConfig.lang,
  };

  const isEmpty = prompts.length === 0 && tools.length === 0 && articles.length === 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="grain border-b-2 border-ink bg-paper-warm">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
            <Link href="/categories" className="hover:text-foreground hover:underline">
              Topics
            </Link>
            <span className="mx-1.5">/</span>
            <span>{cluster.name}</span>
          </nav>

          <span
            className={`inline-block rounded-sm px-2 py-0.5 text-[11px] font-semibold ${chipClass(
              cluster.chip
            )}`}
          >
            {cluster.tagline}
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {cluster.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {cluster.description}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {isEmpty && (
          <div className="rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
            <p className="font-display text-lg font-bold text-foreground">
              Nothing here yet
            </p>
            <Link href="/prompts" className="mt-1 inline-block text-sm text-link hover:underline">
              Browse everything
            </Link>
          </div>
        )}

        {prompts.length > 0 && (
          <section className="mb-14">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-foreground">Prompts</h2>
              <Link
                href={`/prompts?category=${cluster.slug}`}
                className="text-sm font-medium text-link hover:underline"
              >
                All →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {prompts.map((p) => (
                <PromptCard key={p.id} prompt={p} featured={p.featured} />
              ))}
            </div>
          </section>
        )}

        {tools.length > 0 && (
          <section className="mb-14">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-foreground">Tools</h2>
              <Link
                href={`/tools?category=${cluster.slug}`}
                className="text-sm font-medium text-link hover:underline"
              >
                All →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((t) => (
                <ToolCard key={t.id} tool={t} featured={t.featured} />
              ))}
            </div>
          </section>
        )}

        {articles.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 font-display text-2xl font-bold text-foreground">Tutorials</h2>
            <div className="space-y-4">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-border pt-8">
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Other topics</h2>
          <div className="flex flex-wrap gap-2">
            {CLUSTERS.filter((c) => c.slug !== cluster.slug).map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-ink hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
