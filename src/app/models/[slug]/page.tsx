import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { promptCardInclude, PUBLISHED } from "@/lib/queries";
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


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = await prisma.aiModel.findUnique({ where: { slug } });
  if (!model) return { title: "Model not found" };

  return {
    title: `${model.name} prompts`,
    description: (model.blurb || `Free copy-paste prompts for ${model.name}.`).slice(0, 155),
    alternates: { canonical: absoluteUrl(`/models/${model.slug}`) },
  };
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = await prisma.aiModel.findUnique({ where: { slug } });
  if (!model) notFound();

  const [prompts, others] = await Promise.all([
    prisma.prompt.findMany({
      where: { ...PUBLISHED, modelId: model.id },
      include: promptCardInclude,
      orderBy: [{ featured: "desc" }, { copies: "desc" }],
    }),
    prisma.aiModel.findMany({
      where: { id: { not: model.id } },
      orderBy: { order: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${model.name} prompts | ${siteConfig.name}`,
    description: model.blurb ?? undefined,
    url: absoluteUrl(`/models/${model.slug}`),
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
            <span>{model.name}</span>
          </nav>

          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {model.name} prompts
          </h1>
          {model.blurb && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {model.blurb}
            </p>
          )}
          {model.url && (
            <a
              href={model.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-lime"
            >
              Open {model.name} <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {prompts.length === 0 ? (
          <div className="rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
            <p className="font-display text-lg font-bold text-foreground">
              No {model.name} prompts yet
            </p>
            <Link href="/prompts" className="mt-1 inline-block text-sm text-link hover:underline">
              Browse the full library
            </Link>
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
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Other models</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((m) => (
              <Link
                key={m.slug}
                href={`/models/${m.slug}`}
                className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-ink hover:text-foreground"
              >
                {m.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
