import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { revalidatePrompts } from "@/api/revalidate";
import { getCurrentAdmin } from "@/lib/session";
import { generateSlug } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { upsertTags } from "@/lib/tags";
import { OUTPUT_TYPE_VALUES } from "@/lib/prompts";

/** GET — all prompts including drafts. Admin only. */
async function GETHandler() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prompts = await prisma.prompt.findMany({
    include: {
      model: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { examples: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ prompts });
}

/** POST — create a prompt. Always starts as DRAFT. */
async function POSTHandler(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const promptBody = String(body.body ?? "").trim();
  const outputType = String(body.outputType ?? "");

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!promptBody) return NextResponse.json({ error: "Prompt text is required" }, { status: 400 });
  if (!OUTPUT_TYPE_VALUES.includes(outputType as never)) {
    return NextResponse.json({ error: "A valid output type is required" }, { status: 400 });
  }

  let slug = generateSlug(String(body.slug || title));
  if (await prisma.prompt.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now()}`;
  }

  const modelSlug = body.modelSlug ? String(body.modelSlug) : null;
  const categorySlug = body.categorySlug ? String(body.categorySlug) : null;
  const [model, category] = await Promise.all([
    modelSlug ? prisma.aiModel.findUnique({ where: { slug: modelSlug } }) : null,
    categorySlug ? prisma.category.findUnique({ where: { slug: categorySlug } }) : null,
  ]);

  const tagIds = await upsertTags(
    Array.isArray(body.tags) ? (body.tags as string[]) : []
  );

  const prompt = await prisma.prompt.create({
    data: {
      title,
      slug,
      // Plain text — this is the copy-paste payload, never HTML.
      body: promptBody,
      negative: body.negative ? String(body.negative) : null,
      description: body.description ? String(body.description) : null,
      // Tips is the one rich-text field, so it gets sanitized.
      tips: body.tips ? sanitizeHtml(String(body.tips)) : null,
      kind: (body.kind as "IMAGE" | "VIDEO" | "TEXT") ?? "IMAGE",
      outputType: outputType as never,
      difficulty: (body.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED") ?? "BEGINNER",
      aspectRatio: body.aspectRatio ? String(body.aspectRatio) : null,
      parameters: body.parameters ? String(body.parameters) : null,
      status: "DRAFT",
      authorId: admin.id,
      modelId: model?.id ?? null,
      categoryId: category?.id ?? null,
      metaTitle: body.metaTitle ? String(body.metaTitle) : title,
      metaDesc: body.description ? String(body.description).slice(0, 155) : null,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });

  revalidatePrompts(prompt.slug);
  return NextResponse.json(prompt, { status: 201 });
}

export const GET = withApiErrors(GETHandler);
export const POST = withApiErrors(POSTHandler);
