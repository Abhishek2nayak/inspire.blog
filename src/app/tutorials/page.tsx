import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { articleCardInclude, PUBLISHED } from "@/lib/queries";
import { siteConfig, absoluteUrl } from "@/lib/site-config";
import ArticleCard from "@/components/article/ArticleCard";

export const metadata: Metadata = {
  title: "Tutorials & guides",
  description:
    "Step-by-step guides for making thumbnails, reels, carousels and ad creative with AI — with the exact prompts and tools used.",
  alternates: { canonical: absoluteUrl("/tutorials") },
};

export default async function TutorialsPage() {
  const articles = await prisma.article.findMany({
    where: PUBLISHED,
    include: articleCardInclude,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Tutorials & guides | ${siteConfig.name}`,
    url: absoluteUrl("/tutorials"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 20).map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/article/${a.slug}`),
        name: a.title,
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
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Tutorials &amp; guides
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Complete workflows, start to finish — every step, every prompt, every tool.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {articles.length === 0 ? (
          <div className="rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
            <p className="font-display text-lg font-bold text-foreground">
              No tutorials published yet
            </p>
            <Link href="/prompts" className="mt-1 inline-block text-sm text-link hover:underline">
              Browse the prompt library instead
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} featured={a.featured} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
