import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OUTPUT_TYPES } from "@/lib/prompts";
import { siteConfig, absoluteUrl } from "@/lib/site-config";
import PromptFilterBar from "@/components/prompt/PromptFilterBar";
import PromptResults from "@/components/prompt/PromptResults";
import { GridSkeleton } from "@/components/shared/Skeletons";

export const metadata: Metadata = {
  title: "AI prompt library",
  description:
    "Copy-paste AI prompts for YouTube thumbnails, Instagram posts, reels, banners and more — each with the model and settings that produced it.",
  alternates: { canonical: absoluteUrl("/prompts") },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = {
    outputSlug: one(sp.output),
    modelSlug: one(sp.model),
    categorySlug: one(sp.category),
    difficulty: one(sp.difficulty),
    price: one(sp.price),
    sort: one(sp.sort),
  };

  // Small, fast lookups for the filter bar. Kept out of the suspended child so
  // the filter UI renders immediately and stays mounted between navigations.
  const [models, categories] = await Promise.all([
    prisma.aiModel.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
  ]);

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== "sort" && Boolean(v)
  ).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `AI prompt library | ${siteConfig.name}`,
    url: absoluteUrl("/prompts"),
    inLanguage: siteConfig.lang,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="grain border-b-2 border-ink bg-paper-warm">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Prompt library
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Copy-paste prompts for the things creators actually make. Every one lists the model
            and settings it was written for.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {OUTPUT_TYPES.slice(0, 6).map((o) => (
              <Link
                key={o.slug}
                href={`/prompts/for/${o.slug}`}
                className="rounded-sm border-2 border-ink bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-lime"
              >
                {o.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <PromptFilterBar
          models={models.map((m) => ({ value: m.slug, label: m.name }))}
          categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
          activeCount={activeCount}
        />

        {/* Keyed on the filters so React swaps the grid (showing the skeleton)
            rather than reusing a stale one when they change. */}
        <Suspense
          key={JSON.stringify(filters)}
          fallback={
            <div className="mt-10">
              <GridSkeleton count={6} />
            </div>
          }
        >
          <PromptResults {...filters} />
        </Suspense>
      </div>
    </>
  );
}
