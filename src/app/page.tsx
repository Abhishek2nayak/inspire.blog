import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  promptCardInclude,
  toolCardInclude,
  articleCardInclude,
  PUBLISHED,
  JOIN,
} from "@/lib/queries";
// Aliased: the bare names collide with the PromptCard/ToolCard components below.
import type {
  PromptCard as PromptCardData,
  ToolCard as ToolCardData,
  ArticleCardData,
} from "@/lib/queries";
import { safeQuery } from "@/lib/safe-query";
import { OUTPUT_TYPES } from "@/lib/prompts";
import { CLUSTERS, chipClass } from "@/lib/categories";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import PromptCard from "@/components/prompt/PromptCard";
import ToolCard from "@/components/tool/ToolCard";
import ArticleCard from "@/components/article/ArticleCard";
import NewsletterSignup from "@/components/shared/NewsletterSignup";

export const metadata: Metadata = {
  // The layout supplies the title; this adds the self-canonical, which the
  // homepage was missing entirely.
  alternates: { canonical: siteConfig.url },
};

/**
 * Cached for 15 minutes rather than rendered per request.
 *
 * This page reads no cookies, no headers and no searchParams — nothing about
 * it is per-visitor, so `force-dynamic` was making the most-crawled URL on the
 * site pay 17 SQL statements on every bot hit for no benefit. Editors get
 * fresher results than this anyway: the admin write routes call
 * revalidatePrompts() / revalidateTools() / revalidateArticles(), each of
 * which busts this page immediately on publish.
 */
export const revalidate = 900;

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      <Link
        href={href}
        className="shrink-0 text-sm font-medium text-link hover:underline"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

export default async function HomePage() {
  // safeQuery is required now that this page prerenders.
  //
  // Dropping `force-dynamic` moved the homepage into the build's static
  // generation pass, which reintroduces the build-time database dependency
  // that commit 83ceb7d removed. Wrapping it keeps the deploy independent of
  // the database: a page built while Neon is scaled to zero renders empty and
  // repairs itself at the next revalidation instead of failing the build.
  const [featuredPrompts, topTools, latestArticles, promptCategories] = await safeQuery(
    () =>
      Promise.all([
        prisma.prompt.findMany({
          ...JOIN,
          where: PUBLISHED,
          include: promptCardInclude,
          orderBy: [{ featured: "desc" }, { copies: "desc" }],
          take: 6,
        }),
        prisma.tool.findMany({
          ...JOIN,
          where: PUBLISHED,
          include: toolCardInclude,
          orderBy: [{ featured: "desc" }, { name: "asc" }],
          take: 6,
        }),
        prisma.article.findMany({
          ...JOIN,
          where: PUBLISHED,
          include: articleCardInclude,
          orderBy: { publishedAt: "desc" },
          take: 4,
        }),
        // Category-wise prompt shelves — each category that has at least one
        // published prompt gets its own row further down the page, so
        // browsing by topic doesn't require a click through to /categories.
        prisma.category.findMany({
          ...JOIN,
          where: { prompts: { some: PUBLISHED } },
          orderBy: { order: "asc" },
          take: 6,
          select: {
            id: true,
            name: true,
            slug: true,
            chip: true,
            prompts: {
              where: PUBLISHED,
              include: promptCardInclude,
              orderBy: [{ featured: "desc" }, { copies: "desc" }],
              take: 4,
            },
          },
        }),
      ]),
    [[], [], [], []] as [
      PromptCardData[],
      ToolCardData[],
      ArticleCardData[],
      { id: string; name: string; slug: string; chip: string; prompts: PromptCardData[] }[],
    ]
  );

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="grain border-b-2 border-ink bg-paper-warm">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-green-text">
              Free AI prompts for ChatGPT, Gemini &amp; Midjourney · no signup needed
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
              Make the thing.{" "}
              <span className="inline-block border-2 border-ink bg-lime px-2 text-ink shadow-[3px_3px_0_0_var(--ink)]">
                Skip the blank page.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Browse and copy free AI prompts for YouTube thumbnails, reels, Instagram posts and
              banners — each tested on the model it was built for, ready to paste into ChatGPT,
              Gemini or Midjourney.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/prompts"
                className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-lime px-5 py-2.5 text-sm font-semibold text-ink shadow-[3px_3px_0_0_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-lime-deep hover:shadow-[2px_2px_0_0_var(--ink)]"
              >
                Browse prompts <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-md border-2 border-ink px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card"
              >
                Compare tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse by what you're making ─────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            What are you making?
          </h2>
          <div className="flex flex-wrap gap-2">
            {OUTPUT_TYPES.map((o) => (
              <Link
                key={o.slug}
                href={`/prompts/for/${o.slug}`}
                className={`rounded-sm border-2 border-ink px-3 py-1.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${chipClass(
                  o.chip
                )}`}
              >
                {o.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured prompts ─────────────────────────────────────────── */}
      {featuredPrompts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <SectionHeading title="Prompts worth stealing" href="/prompts" linkLabel="All prompts" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPrompts.map((p) => (
              <PromptCard key={p.id} prompt={p} featured={p.featured} />
            ))}
          </div>
        </section>
      )}

      {/* ── Topics ───────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-paper-cool">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionHeading title="Browse by topic" href="/categories" linkLabel="All topics" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CLUSTERS.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="group rounded-md border border-border bg-card p-5 transition-colors hover:border-ink"
              >
                <span
                  className={`inline-block rounded-sm px-2 py-0.5 text-[11px] font-semibold ${chipClass(
                    c.chip
                  )}`}
                >
                  {c.tagline}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground group-hover:underline">
                  {c.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category-wise prompts ───────────────────────────────────────
          A shelf per category, so browsing by topic doesn't require a
          click through to /categories — the topic cards above are the
          index, these are the preview. */}
      {promptCategories.map((category) =>
        category.prompts.length > 0 ? (
          <section key={category.id} className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeading
              title={`${category.name} prompts`}
              href={`/prompts?category=${category.slug}`}
              linkLabel="All"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {category.prompts.map((p) => (
                <PromptCard key={p.id} prompt={p} featured={p.featured} />
              ))}
            </div>
          </section>
        ) : null
      )}

      {/* ── Tools ────────────────────────────────────────────────────── */}
      {topTools.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <SectionHeading title="Tools that earn their place" href="/tools" linkLabel="All tools" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topTools.map((t) => (
              <ToolCard key={t.id} tool={t} featured={t.featured} />
            ))}
          </div>
        </section>
      )}

      {/* ── Tutorials ────────────────────────────────────────────────── */}
      {latestArticles.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeading
              title="Step-by-step tutorials"
              href="/tutorials"
              linkLabel="All tutorials"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {latestArticles.map((a) => (
                <ArticleCard key={a.id} article={a} featured={a.featured} />
              ))}
            </div>
          </div>
        </section>
      )}

      <NewsletterSignup
        variant="hero"
        title="New prompts, every week"
        description={`One email a week from ${siteConfig.name}: the best new prompts, plus what actually changed in the tools.`}
      />
    </>
  );
}
