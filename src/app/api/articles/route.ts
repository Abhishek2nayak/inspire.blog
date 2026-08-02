import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/session";
import { generateSlug, calculateReadTime, getExcerpt } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { upsertTags } from "@/lib/tags";
import { articleCardInclude, PUBLISHED } from "@/lib/queries";

/**
 * GET /api/articles
 *   ?mine=true            – admin's own articles
 *   ?include_drafts=true  – include non-published (admin only)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "true";
  const includeDrafts = url.searchParams.get("include_drafts") === "true";

  // Draft visibility is an admin capability, never inferable from a query param.
  const admin = mine || includeDrafts ? await getCurrentAdmin() : null;
  if ((mine || includeDrafts) && !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await prisma.article.findMany({
    where: {
      ...(includeDrafts && admin ? {} : PUBLISHED),
      ...(mine && admin ? { authorId: admin.id } : {}),
    },
    include: articleCardInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({ articles });
}

/** POST /api/articles — create a draft. Admin only. */
export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let slug = generateSlug(String(body.slug || title));
  if (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now()}`;
  }

  // Sanitized before it reaches the DB, so unsafe markup is never stored.
  const content = sanitizeHtml(String(body.content ?? ""));
  const tagIds = await upsertTags(
    Array.isArray(body.tags) ? (body.tags as string[]) : []
  );

  // Honour the requested status. Previously this always created a DRAFT, so
  // hitting "Publish" on a new article reported success while saving a draft.
  const requested = String(body.status ?? "DRAFT");
  const status = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"].includes(requested)
    ? (requested as "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED")
    : "DRAFT";

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      content,
      subtitle: body.subtitle ? String(body.subtitle) : null,
      excerpt: body.excerpt ? String(body.excerpt) : getExcerpt(content),
      coverImage: body.coverImage ? String(body.coverImage) : null,
      canonical: body.canonical ? String(body.canonical) : null,
      metaTitle: body.metaTitle ? String(body.metaTitle) : null,
      metaDesc: body.metaDesc ? String(body.metaDesc) : null,
      readTime: calculateReadTime(content),
      status,
      ...(status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
      authorId: admin.id,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });

  return NextResponse.json(article, { status: 201 });
}
