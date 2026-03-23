import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;
  const { emoji } = await req.json();

  if (!emoji) {
    return NextResponse.json({ error: "Emoji required" }, { status: 400 });
  }

  const existing = await prisma.reaction.findFirst({
    where: { postId, userId: session.user.id, emoji },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({
      data: { postId, userId: session.user.id, emoji },
    });
  }

  const count = await prisma.reaction.count({ where: { postId, emoji } });

  return NextResponse.json({ emoji, count, reacted: !existing });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id: postId } = await params;

  const reactions = await prisma.reaction.groupBy({
    by: ["emoji"],
    where: { postId },
    _count: { emoji: true },
  });

  const userReactions = session?.user?.id
    ? await prisma.reaction.findMany({
        where: { postId, userId: session.user.id },
        select: { emoji: true },
      })
    : [];

  const userEmojiSet = new Set(userReactions.map((r) => r.emoji));

  const result = reactions.map((r) => ({
    emoji: r.emoji,
    count: r._count.emoji,
    reacted: userEmojiSet.has(r.emoji),
  }));

  return NextResponse.json(result);
}
