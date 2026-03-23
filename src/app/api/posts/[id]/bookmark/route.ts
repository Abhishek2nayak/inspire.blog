import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ bookmarked: false });

  const { id } = await params;
  const bookmark = await prisma.bookmark.findFirst({ where: { userId: user.id, postId: id } });
  return NextResponse.json({ bookmarked: !!bookmark });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.bookmark.findFirst({ where: { userId: user.id, postId: id } });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.bookmark.create({ data: { userId: user.id, postId: id } });
  return NextResponse.json({ bookmarked: true });
}
