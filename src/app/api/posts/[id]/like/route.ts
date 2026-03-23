import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  const { id } = await params;

  const [liked, count] = await Promise.all([
    user
      ? prisma.like.findFirst({ where: { userId: user.id, postId: id } })
      : null,
    prisma.like.count({ where: { postId: id } }),
  ]);

  return NextResponse.json({ liked: !!liked, count });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const existing = await prisma.like.findFirst({ where: { userId: user.id, postId: id } });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({ where: { postId: id } });
    return NextResponse.json({ liked: false, count });
  }

  await prisma.like.create({ data: { userId: user.id, postId: id } });

  if (post.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        type: "LIKE",
        recipientId: post.authorId,
        actorId: user.id,
        postId: id,
      },
    });
  }

  const count = await prisma.like.count({ where: { postId: id } });
  return NextResponse.json({ liked: true, count });
}
