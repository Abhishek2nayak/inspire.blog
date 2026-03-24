import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://inspire-blog-five.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/series`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // All published articles
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/article/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // All tags
  const tags = await prisma.tag.findMany({
    select: { slug: true },
  });

  const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${BASE_URL}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // All public author profiles (users who have at least one published post)
  const authors = await prisma.user.findMany({
    where: { posts: { some: { published: true } } },
    select: { id: true, updatedAt: true },
  });

  const profileRoutes: MetadataRoute.Sitemap = authors.map((user) => ({
    url: `${BASE_URL}/profile/${user.id}`,
    lastModified: user.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // All series
  const series = await prisma.series.findMany({
    select: { slug: true, updatedAt: true },
  });

  const seriesRoutes: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${BASE_URL}/series/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...postRoutes,
    ...tagRoutes,
    ...profileRoutes,
    ...seriesRoutes,
  ];
}
