import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const authorId = searchParams.get("authorId");

  const series = await prisma.series.findMany({
    where: authorId ? { authorId } : undefined,
    include: {
      author: { select: { id: true, name: true, image: true } },
      posts: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(series);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, coverImage } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = generateSlug(title);

  const series = await prisma.series.create({
    data: { title: title.trim(), slug, description, coverImage, authorId: session.user.id },
  });

  return NextResponse.json(series, { status: 201 });
}
