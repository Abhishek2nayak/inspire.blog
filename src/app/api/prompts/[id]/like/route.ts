import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Toggle a like on a prompt. Requires sign-in — same pattern as
 * /api/bookmarks — so counts are one-per-user and not inflatable by
 * clearing cookies. `prompt.likeCount` is a denormalized counter (see the
 * schema comment on `copies`), kept in sync inside the same transaction as
 * the Like row so it never drifts from the row count.
 */
async function POSTHandler(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Sign in to like" }, { status: 401 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_promptId: { userId: user.id, promptId: id } },
  });

  try {
    if (existing) {
      const [, prompt] = await prisma.$transaction([
        prisma.like.delete({ where: { id: existing.id } }),
        prisma.prompt.update({
          where: { id },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        }),
      ]);
      return NextResponse.json({ liked: false, likeCount: prompt.likeCount });
    }

    const [, prompt] = await prisma.$transaction([
      prisma.like.create({ data: { userId: user.id, promptId: id } }),
      prisma.prompt.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      }),
    ]);
    return NextResponse.json({ liked: true, likeCount: prompt.likeCount });
  } catch {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }
}

export const POST = withApiErrors(POSTHandler);
