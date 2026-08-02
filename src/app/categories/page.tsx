import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CLUSTERS, chipClass } from "@/lib/categories";
import { absoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Topics",
  description:
    "Browse AI prompts, tools and tutorials by topic — image and design, video and audio, writing, productivity, and creator workflows.",
  alternates: { canonical: absoluteUrl("/categories") },
};

export default async function CategoriesPage() {
  // Counts come from the DB; the card list comes from CLUSTERS so the page
  // renders correctly even before a category row has any content.
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      _count: { select: { prompts: true, tools: true, articles: true } },
    },
  });
  const counts = new Map(categories.map((c) => [c.slug, c._count]));

  return (
    <>
      <section className="grain border-b-2 border-ink bg-paper-cool">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Topics
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Five areas, each with its own prompts, tools and step-by-step guides.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-5 sm:grid-cols-2">
          {CLUSTERS.map((c) => {
            const n = counts.get(c.slug);
            return (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="group card-framed p-6 transition-transform hover:-translate-y-0.5"
              >
                <span
                  className={`inline-block rounded-sm px-2 py-0.5 text-[11px] font-semibold ${chipClass(
                    c.chip
                  )}`}
                >
                  {c.tagline}
                </span>
                <h2 className="mt-3 font-display text-xl font-bold text-foreground group-hover:underline">
                  {c.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
                {n && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    {n.prompts} prompts · {n.tools} tools · {n.articles} tutorials
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
