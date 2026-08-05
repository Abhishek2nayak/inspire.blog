import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { revalidateArticles } from "@/api/revalidate";
import { getCurrentAdmin } from "@/lib/session";
import { calculateReadTime, generateSlug, getExcerpt } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { upsertTags } from "@/lib/tags";

/** GET a single article. Drafts are visible to admins only. */
async function GETHandler(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } }, steps: { orderBy: { order: "asc" } } },
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (article.status !== "PUBLISHED") {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

/** PATCH — update or publish. Admin only. */
async function PATCHHandler(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const content =
    body.content !== undefined ? sanitizeHtml(String(body.content)) : undefined;

  const status = body.status ? String(body.status) : undefined;
  const publishing = status === "PUBLISHED" && existing.status !== "PUBLISHED";

  if (Array.isArray(body.tags)) {
    const tagIds = await upsertTags(body.tags as string[]);
    await prisma.articleTag.deleteMany({ where: { articleId: id } });
    await prisma.articleTag.createMany({
      data: tagIds.map((tagId) => ({ articleId: id, tagId })),
      skipDuplicates: true,
    });
  }

  let slug: string | undefined;
  if (body.slug && String(body.slug) !== existing.slug) {
    slug = generateSlug(String(body.slug));
    if (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(slug ? { slug } : {}),
      ...(content !== undefined
        ? { content, readTime: calculateReadTime(content), excerpt: getExcerpt(content) }
        : {}),
      ...(body.subtitle !== undefined ? { subtitle: String(body.subtitle) } : {}),
      ...(body.excerpt !== undefined ? { excerpt: String(body.excerpt) } : {}),
      ...(body.coverImage !== undefined ? { coverImage: String(body.coverImage) } : {}),
      ...(body.metaTitle !== undefined ? { metaTitle: String(body.metaTitle) } : {}),
      ...(body.metaDesc !== undefined ? { metaDesc: String(body.metaDesc) } : {}),
      ...(body.kind !== undefined
        ? { kind: String(body.kind) as "TUTORIAL" | "GUIDE" | "COMPARISON" | "ROUNDUP" | "NEWS" }
        : {}),
      ...(status
        ? { status: status as "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED" }
        : {}),
      // Stamp publishedAt on the first publish only, so re-publishing an edit
      // doesn't reorder the feed or reset the canonical publication date.
      ...(publishing ? { publishedAt: new Date() } : {}),
    },
  });

  revalidateArticles(article.slug);
  return NextResponse.json(article);
}

/** DELETE. Admin only. */
async function DELETEHandler(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.article.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateArticles();
  return NextResponse.json({ ok: true });
}

export const GET = withApiErrors(GETHandler);
export const PATCH = withApiErrors(PATCHHandler);
export const DELETE = withApiErrors(DELETEHandler);
