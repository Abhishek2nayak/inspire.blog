import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-config";
import { safeQuery } from "@/lib/safe-query";

/**
 * Rendered on demand and revalidated, never prerendered against the database
 * at build time. A deploy must not fail because the database is empty,
 * unmigrated or asleep — that is what broke the first production build.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All tags",
  description: "Every tag across the prompt library, tool directory and tutorials.",
  alternates: { canonical: absoluteUrl("/tags") },
};

export default async function TagsPage() {
  const tags = await safeQuery(
    () =>
      prisma.tag.findMany({
        include: { _count: { select: { prompts: true, tools: true, articles: true } } },
        orderBy: { name: "asc" },
      }),
    []
  );

  const used = tags
    .map((t) => ({ ...t, total: t._count.prompts + t._count.tools + t._count.articles }))
    .filter((t) => t.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <>
      <section className="grain border-b-2 border-ink bg-paper-cool">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Tags
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {used.length} tags across prompts, tools and tutorials.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          {used.map((t) => (
            <Link
              key={t.id}
              href={`/tag/${t.slug}`}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-ink"
            >
              #{t.name}
              <span className="text-xs text-muted-foreground">{t.total}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
