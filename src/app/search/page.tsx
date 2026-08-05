import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
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

export const metadata: Metadata = {
  title: "Search",
  description: "Search prompts, tools and tutorials.",
  alternates: { canonical: absoluteUrl("/search") },
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";

  const contains = { contains: q, mode: "insensitive" as const };
  const hasQuery = q.length >= 2;

  const [prompts, tools, articles] = hasQuery
    ? await Promise.all([
        prisma.prompt.findMany({
          ...JOIN,
          where: {
            ...PUBLISHED,
            OR: [{ title: contains }, { description: contains }, { body: contains }],
          },
          include: promptCardInclude,
          orderBy: { copies: "desc" },
          take: 12,
        }),
        prisma.tool.findMany({
          ...JOIN,
          where: { ...PUBLISHED, OR: [{ name: contains }, { tagline: contains }] },
          include: toolCardInclude,
          take: 6,
        }),
        prisma.article.findMany({
          ...JOIN,
          where: { ...PUBLISHED, OR: [{ title: contains }, { excerpt: contains }] },
          include: articleCardInclude,
          orderBy: { publishedAt: "desc" },
          take: 6,
        }),
      ])
    : [[], [], []];

  const total = prompts.length + tools.length + articles.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Search</h1>

      {/* A plain GET form: works without JS, and the result URL is shareable. */}
      <form action="/search" method="get" className="mt-5 flex max-w-xl gap-2">
        <label htmlFor="q" className="sr-only">
          Search prompts, tools and tutorials
        </label>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="thumbnail, midjourney, reels…"
            className="w-full rounded-md border-2 border-ink bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border-2 border-ink bg-lime px-4 py-2.5 text-sm font-semibold text-ink hover:bg-lime-deep"
        >
          Search
        </button>
      </form>

      {hasQuery && (
        <p className="mt-5 text-sm text-muted-foreground">
          {total} result{total === 1 ? "" : "s"} for “{q}”
        </p>
      )}

      {hasQuery && total === 0 && (
        <div className="mt-8 rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
          <p className="font-display text-lg font-bold text-foreground">Nothing found</p>
          <Link href="/prompts" className="mt-1 inline-block text-sm text-link hover:underline">
            Browse the prompt library
          </Link>
        </div>
      )}

      {prompts.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">Prompts</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))}
          </div>
        </section>
      )}

      {tools.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">Tools</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">Tutorials</h2>
          <div className="space-y-4">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
