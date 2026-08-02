import { prisma } from "@/lib/prisma";
import { siteConfig, absoluteUrl } from "@/lib/site-config";

/** Escape for XML text/attribute content. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RSS 2.0 across all three content types.
 *
 * The root layout has advertised <link rel="alternate" type="application/rss+xml">
 * pointing here since the rebrand, but the route never existed — every reader
 * that followed it got a 404.
 */
export async function GET() {
  const [prompts, tools, articles] = await Promise.all([
    prisma.prompt.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, title: true, description: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
    }),
    prisma.tool.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, name: true, tagline: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 10,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, title: true, excerpt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
    }),
  ]);

  const items = [
    ...prompts.map((p) => ({
      title: p.title,
      link: absoluteUrl(`/prompts/${p.slug}`),
      description: p.description ?? "",
      date: p.publishedAt,
      category: "Prompt",
    })),
    ...tools.map((t) => ({
      title: `${t.name} — review`,
      link: absoluteUrl(`/tools/${t.slug}`),
      description: t.tagline,
      date: t.publishedAt,
      category: "Tool",
    })),
    ...articles.map((a) => ({
      title: a.title,
      link: absoluteUrl(`/article/${a.slug}`),
      description: a.excerpt ?? "",
      date: a.publishedAt,
      category: "Tutorial",
    })),
  ]
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
    .slice(0, 30);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${esc(siteConfig.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
${items
  .map(
    (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${i.link}</link>
      <guid isPermaLink="true">${i.link}</guid>
      <description>${esc(i.description)}</description>
      <category>${i.category}</category>
      ${i.date ? `<pubDate>${i.date.toUTCString()}</pubDate>` : ""}
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
