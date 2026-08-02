import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { OUTPUT_TYPES } from "@/lib/prompts";
import { CLUSTERS } from "@/lib/categories";

const BASE = siteConfig.url;

/**
 * Every indexable URL.
 *
 * The previous version listed only articles, categories and a few static
 * pages — it was missing prompts, tools, model pillars and output-type
 * pillars, which is the overwhelming majority of the site. Those pages
 * existed but Google had no way to discover most of them.
 *
 * Wrapped in try/catch: Neon scales to zero, and a sitemap that 500s is
 * worse than one that temporarily lists only static routes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/prompts`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/tutorials`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/tags`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/sell`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Code-driven pillars — no DB needed, so these are always present.
  const outputRoutes: MetadataRoute.Sitemap = OUTPUT_TYPES.map((o) => ({
    url: `${BASE}/prompts/for/${o.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const clusterRoutes: MetadataRoute.Sitemap = CLUSTERS.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  try {
    const [prompts, tools, articles, models, tags] = await Promise.all([
      prisma.prompt.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.tool.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.aiModel.findMany({ select: { slug: true } }),
      prisma.tag.findMany({ select: { slug: true } }),
    ]);

    return [
      ...staticRoutes,
      ...outputRoutes,
      ...clusterRoutes,
      ...prompts.map((p) => ({
        url: `${BASE}/prompts/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.9,
      })),
      ...tools.map((t) => ({
        url: `${BASE}/tools/${t.slug}`,
        lastModified: t.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...articles.map((a) => ({
        url: `${BASE}/article/${a.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.85,
      })),
      ...models.map((m) => ({
        url: `${BASE}/models/${m.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...tags.map((t) => ({
        url: `${BASE}/tag/${t.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
    ];
  } catch {
    return [...staticRoutes, ...outputRoutes, ...clusterRoutes];
  }
}
