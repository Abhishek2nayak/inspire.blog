import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { PUBLISHED } from "@/lib/queries";

/** Search across all three content types. */
async function GETHandler(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ prompts: [], tools: [], articles: [], total: 0 });
  }

  const contains = { contains: q, mode: "insensitive" as const };

  const [prompts, tools, articles] = await Promise.all([
    prisma.prompt.findMany({
      where: {
        ...PUBLISHED,
        OR: [{ title: contains }, { description: contains }, { body: contains }],
      },
      select: { id: true, title: true, slug: true, description: true, outputType: true },
      orderBy: { copies: "desc" },
      take: 10,
    }),
    prisma.tool.findMany({
      where: { ...PUBLISHED, OR: [{ name: contains }, { tagline: contains }] },
      select: { id: true, name: true, slug: true, tagline: true, pricing: true },
      take: 10,
    }),
    prisma.article.findMany({
      where: { ...PUBLISHED, OR: [{ title: contains }, { excerpt: contains }] },
      select: { id: true, title: true, slug: true, excerpt: true, readTime: true },
      orderBy: { publishedAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    prompts,
    tools,
    articles,
    total: prompts.length + tools.length + articles.length,
    query: q,
  });
}

export const GET = withApiErrors(GETHandler);
