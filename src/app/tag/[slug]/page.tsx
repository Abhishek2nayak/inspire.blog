import { cache } from "react";
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
import { absoluteUrl } from "@/lib/site-config";
import PromptCard from "@/components/prompt/PromptCard";
import ToolCard from "@/components/tool/ToolCard";
import ArticleCard from "@/components/article/ArticleCard";

/**
 * Tag pages are the highest-volume, lowest-value URLs on the site — roughly
 * 45 of them, all in the sitemap. Uncached they were the single largest slice
 * of the crawl bill.
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


/**
 * Shared by generateMetadata and the page.
 *
 * These two ran the identical findUnique separately — the `cache()` pattern
 * already used on the prompt/tool/article detail pages, just never applied
 * here.
 */
const getTag = cache(async (slug: string) => {
  return prisma.tag.findUnique({ where: { slug } });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return { title: "Tag not found" };

  return {
    title: `#${tag.name}`,
    description: `AI prompts, tools and tutorials tagged ${tag.name}.`,
    alternates: { canonical: absoluteUrl(`/tag/${tag.slug}`) },
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) notFound();

  // All three were unbounded. A tag is a browse surface, not an archive — the
  // cap keeps one over-applied tag from pulling the entire table.
  const [prompts, tools, articles] = await Promise.all([
    prisma.prompt.findMany({
      ...JOIN,
      where: { ...PUBLISHED, tags: { some: { tagId: tag.id } } },
      include: promptCardInclude,
      orderBy: { copies: "desc" },
      take: 24,
    }),
    prisma.tool.findMany({
      ...JOIN,
      where: { ...PUBLISHED, tags: { some: { tagId: tag.id } } },
      include: toolCardInclude,
      orderBy: { name: "asc" },
      take: 24,
    }),
    prisma.article.findMany({
      ...JOIN,
      where: { ...PUBLISHED, tags: { some: { tagId: tag.id } } },
      include: articleCardInclude,
      orderBy: { publishedAt: "desc" },
      take: 24,
    }),
  ]);

  const total = prompts.length + tools.length + articles.length;

  return (
    <>
      <section className="grain border-b-2 border-ink bg-paper-cool">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted-foreground">
            <Link href="/tags" className="hover:text-foreground hover:underline">
              Tags
            </Link>
          </nav>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            #{tag.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {total} item{total === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {total === 0 && (
          <div className="rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
            <p className="font-display text-lg font-bold text-foreground">Nothing tagged yet</p>
          </div>
        )}

        {prompts.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-5 font-display text-2xl font-bold text-foreground">Prompts</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {prompts.map((p) => (
                <PromptCard key={p.id} prompt={p} />
              ))}
            </div>
          </section>
        )}

        {tools.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-5 font-display text-2xl font-bold text-foreground">Tools</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </section>
        )}

        {articles.length > 0 && (
          <section>
            <h2 className="mb-5 font-display text-2xl font-bold text-foreground">Tutorials</h2>
            <div className="space-y-4">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
