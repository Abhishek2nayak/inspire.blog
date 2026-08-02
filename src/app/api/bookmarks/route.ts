import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * One saved-items endpoint across all three content types.
 * Body: { kind: "ARTICLE" | "PROMPT" | "TOOL", id: string }
 */
type Kind = "ARTICLE" | "PROMPT" | "TOOL";

const FIELD: Record<Kind, "articleId" | "promptId" | "toolId"> = {
  ARTICLE: "articleId",
  PROMPT: "promptId",
  TOOL: "toolId",
};

function parse(body: Record<string, unknown>) {
  const kind = String(body.kind ?? "").toUpperCase() as Kind;
  const id = String(body.id ?? "");
  if (!["ARTICLE", "PROMPT", "TOOL"].includes(kind) || !id) return null;
  return { kind, id };
}

async function GETHandler() {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ bookmarks });
}

/** Toggle: creates the save, or removes it if it already exists. */
async function POSTHandler(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Sign in to save" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = parse(body);
  if (!parsed) {
    return NextResponse.json({ error: "kind and id are required" }, { status: 400 });
  }

  const field = FIELD[parsed.kind];
  const existing = await prisma.bookmark.findFirst({
    where: { userId: user.id, [field]: parsed.id },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.bookmark.create({
    data: { userId: user.id, kind: parsed.kind, [field]: parsed.id },
  });
  return NextResponse.json({ saved: true });
}

export const GET = withApiErrors(GETHandler);
export const POST = withApiErrors(POSTHandler);
