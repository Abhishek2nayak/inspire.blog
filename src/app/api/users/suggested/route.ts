import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    // Return authors with the most published posts + followers, excluding self
    const users = await prisma.user.findMany({
      where: {
        ...(currentUser ? { id: { not: currentUser.id } } : {}),
        posts: { some: { published: true } },
      },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        _count: {
          select: { posts: true, followers: true },
        },
      },
      orderBy: [
        { followers: { _count: "desc" } },
        { posts: { _count: "desc" } },
      ],
      take: 6,
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
