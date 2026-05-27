import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://inspireblog.mythosh.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static pages with weekly changefreq and 0.8 priority
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/feed`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/tags`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // 2. Fetch all published articles
  // Note: Using Prisma directly instead of `fetch('/api/articles')` is the recommended 
  // Next.js App Router convention for sitemap.ts. It guarantees the data is available at build time 
  // without relying on the API server being running during the build step.
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  // 3 & 4. Set article URL structure, changefreq, and priority
  const articleRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/article/${post.slug}`,
    lastModified: post.updatedAt || new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  // 5. Return proper MetadataRoute.Sitemap type
  return [...staticRoutes, ...articleRoutes];
}
