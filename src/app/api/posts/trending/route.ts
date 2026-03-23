import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const where = {
      published: true,
      publishedAt: { gte: sevenDaysAgo },
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, image: true, bio: true },
          },
          tags: { include: { tag: true } },
          _count: {
            select: { likes: true, comments: true, bookmarks: true },
          },
        },
        orderBy: [{ likes: { _count: "desc" } }, { views: "desc" }],
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending posts" },
      { status: 500 }
    );
  }
}
