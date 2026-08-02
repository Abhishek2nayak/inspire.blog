import Link from "next/link";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toolCardInclude, PUBLISHED } from "@/lib/queries";
import { siteConfig, absoluteUrl } from "@/lib/site-config";
import ToolCard from "@/components/tool/ToolCard";
import ToolFilterPills from "@/components/tool/ToolFilterPills";
import AffiliateDisclosure from "@/components/tool/AffiliateDisclosure";

export const metadata: Metadata = {
  title: "AI tools for creators",
  description:
    "Honest reviews of the AI tools worth using for thumbnails, video, images and copy — what each is actually good at, and what it costs.",
  alternates: { canonical: absoluteUrl("/tools") },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PRICING = [
  { value: "FREE", label: "Free" },
  { value: "FREEMIUM", label: "Freemium" },
  { value: "PAID", label: "Paid" },
];

export default async function ToolsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pricing = Array.isArray(sp.pricing) ? sp.pricing[0] : sp.pricing;
  const categorySlug = Array.isArray(sp.category) ? sp.category[0] : sp.category;

  const where: Prisma.ToolWhereInput = {
    ...PUBLISHED,
    ...(pricing && ["FREE", "FREEMIUM", "PAID"].includes(pricing)
      ? { pricing: pricing as Prisma.EnumPricingTierFilter["equals"] }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const [tools, categories] = await Promise.all([
    prisma.tool.findMany({
      where,
      include: toolCardInclude,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `AI tools for creators | ${siteConfig.name}`,
    url: absoluteUrl("/tools"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tools.length,
      itemListElement: tools.slice(0, 20).map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/tools/${t.slug}`),
        name: t.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="grain border-b-2 border-ink bg-paper-cool">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            AI tools, honestly reviewed
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            What each tool is genuinely good at, where it falls short, and whether it belongs in a
            creator&apos;s workflow.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <AffiliateDisclosure className="mb-6" />

        <ToolFilterPills
          className="mb-6"
          pricing={PRICING}
          categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
        />

        <p className="mb-4 text-sm text-muted-foreground">
          {tools.length} tool{tools.length === 1 ? "" : "s"}
        </p>

        {tools.length === 0 ? (
          <div className="rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
            <p className="font-display text-lg font-bold text-foreground">Nothing matches</p>
            <Link href="/tools" className="mt-1 inline-block text-sm text-link hover:underline">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <ToolCard key={t.id} tool={t} featured={t.featured} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
