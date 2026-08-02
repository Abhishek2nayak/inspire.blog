import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { stripHtml } from "@/lib/sanitize";

const MAX_LENGTH = 2000;
/** Crude per-user rate limit. A public comment box attracts spam within weeks. */
const MIN_SECONDS_BETWEEN_COMMENTS = 20;

/** GET /api/comments?articleId=… | ?promptId=… */
async function GETHandler(req: Request) {
  const url = new URL(req.url);
  const articleId = url.searchParams.get("articleId");
  const promptId = url.searchParams.get("promptId");

  if (!articleId && !promptId) {
    return NextResponse.json({ error: "articleId or promptId required" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: {
      hidden: false,
      parentId: null,
      ...(articleId ? { articleId } : { promptId }),
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        where: { hidden: false },
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ comments });
}

/** POST a comment. Any signed-in reader; publishing rights are not required. */
async function POSTHandler(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Stored as plain text and rendered escaped by React — never as HTML.
  const content = stripHtml(String(body.content ?? "")).slice(0, MAX_LENGTH);
  if (!content) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  const articleId = body.articleId ? String(body.articleId) : null;
  const promptId = body.promptId ? String(body.promptId) : null;
  if (!articleId && !promptId) {
    return NextResponse.json({ error: "articleId or promptId required" }, { status: 400 });
  }

  const recent = await prisma.comment.findFirst({
    where: {
      authorId: user.id,
      createdAt: { gt: new Date(Date.now() - MIN_SECONDS_BETWEEN_COMMENTS * 1000) },
    },
    select: { id: true },
  });
  if (recent) {
    return NextResponse.json(
      { error: "You're commenting too quickly. Try again in a moment." },
      { status: 429 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      authorId: user.id,
      articleId,
      promptId,
      parentId: body.parentId ? String(body.parentId) : null,
    },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}

export const GET = withApiErrors(GETHandler);
export const POST = withApiErrors(POSTHandler);
