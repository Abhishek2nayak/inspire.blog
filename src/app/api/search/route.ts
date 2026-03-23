import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ posts: [], tags: [] });
  }

  const [posts, tags] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
        ],
      },
      include: {
        author: { select: { id: true, name: true, image: true, bio: true } },
        tags: { include: { tag: true } },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
      },
      orderBy: { views: "desc" },
      take: 20,
    }),
    prisma.tag.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      include: { _count: { select: { posts: true } } },
      take: 8,
    }),
  ]);

  return NextResponse.json({ posts, tags });
}
