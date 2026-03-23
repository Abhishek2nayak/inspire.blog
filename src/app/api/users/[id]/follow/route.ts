import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (user.id === id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const existingFollow = await prisma.follow.findFirst({
    where: { followerId: user.id, followingId: id },
  });

  if (existingFollow) {
    await prisma.follow.delete({ where: { id: existingFollow.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({ data: { followerId: user.id, followingId: id } });

  await prisma.notification.create({
    data: { type: "FOLLOW", recipientId: id, actorId: user.id },
  });

  return NextResponse.json({ following: true });
}
