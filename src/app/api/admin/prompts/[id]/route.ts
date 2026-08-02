import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/session";
import { generateSlug } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { upsertTags } from "@/lib/tags";

/** GET one prompt with everything the editor needs. */
async function GETHandler(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: {
      model: { select: { slug: true } },
      category: { select: { slug: true } },
      tags: { include: { tag: true } },
      examples: { orderBy: { order: "asc" } },
      variations: { orderBy: { order: "asc" } },
    },
  });

  if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(prompt);
}

/** PATCH — update, or publish. */
async function PATCHHandler(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.prompt.findUnique({
    where: { id },
    include: { _count: { select: { examples: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const status = body.status ? String(body.status) : undefined;
  const publishing = status === "PUBLISHED" && existing.status !== "PUBLISHED";

  /**
   * Publish guard. A prompt with no example output is close to worthless to a
   * reader — they cannot tell whether it produces what they want. This cannot
   * be a DB constraint without breaking draft creation, so it is enforced at
   * the moment of publishing.
   */
  if (status === "PUBLISHED" && existing._count.examples === 0) {
    return NextResponse.json(
      {
        error:
          "Add at least one example image before publishing — readers need to see what this prompt produces.",
      },
      { status: 422 }
    );
  }

  if (Array.isArray(body.tags)) {
    const tagIds = await upsertTags(body.tags as string[]);
    await prisma.promptTag.deleteMany({ where: { promptId: id } });
    await prisma.promptTag.createMany({
      data: tagIds.map((tagId) => ({ promptId: id, tagId })),
      skipDuplicates: true,
    });
  }

  let slug: string | undefined;
  if (body.slug && String(body.slug) !== existing.slug) {
    slug = generateSlug(String(body.slug));
    if (await prisma.prompt.findUnique({ where: { slug } })) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  const modelSlug = body.modelSlug !== undefined ? String(body.modelSlug) : undefined;
  const categorySlug = body.categorySlug !== undefined ? String(body.categorySlug) : undefined;
  const [model, category] = await Promise.all([
    modelSlug ? prisma.aiModel.findUnique({ where: { slug: modelSlug } }) : null,
    categorySlug ? prisma.category.findUnique({ where: { slug: categorySlug } }) : null,
  ]);

  const prompt = await prisma.prompt.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(slug ? { slug } : {}),
      ...(body.body !== undefined ? { body: String(body.body) } : {}),
      ...(body.negative !== undefined ? { negative: String(body.negative) || null } : {}),
      ...(body.description !== undefined
        ? {
            description: String(body.description) || null,
            metaDesc: String(body.description).slice(0, 155) || null,
          }
        : {}),
      ...(body.tips !== undefined ? { tips: sanitizeHtml(String(body.tips)) || null } : {}),
      ...(body.kind !== undefined ? { kind: body.kind as "IMAGE" | "VIDEO" | "TEXT" } : {}),
      ...(body.outputType !== undefined ? { outputType: body.outputType as never } : {}),
      ...(body.difficulty !== undefined
        ? { difficulty: body.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }
        : {}),
      ...(body.aspectRatio !== undefined
        ? { aspectRatio: String(body.aspectRatio) || null }
        : {}),
      ...(body.parameters !== undefined ? { parameters: String(body.parameters) || null } : {}),
      ...(body.featured !== undefined ? { featured: Boolean(body.featured) } : {}),
      ...(modelSlug !== undefined ? { modelId: model?.id ?? null } : {}),
      ...(categorySlug !== undefined ? { categoryId: category?.id ?? null } : {}),
      ...(status ? { status: status as "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED" } : {}),
      // Only stamped on the first publish, so editing a live prompt doesn't
      // reorder the library or reset its publication date.
      ...(publishing ? { publishedAt: new Date() } : {}),
    },
  });

  return NextResponse.json(prompt);
}

async function DELETEHandler(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.prompt.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export const GET = withApiErrors(GETHandler);
export const PATCH = withApiErrors(PATCHHandler);
export const DELETE = withApiErrors(DELETEHandler);
