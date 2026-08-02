import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { generateSlug } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { upsertTags } from "@/lib/tags";
import { OUTPUT_TYPE_VALUES } from "@/lib/prompts";
import { siteConfig } from "@/lib/site-config";

/** Sellers may attach at most this many example images per prompt. */
export const MAX_EXAMPLES = 5;
/** Cap the price so a typo can't list something at $10,000. */
const MAX_PRICE_CENTS = 20000;
/** Slow down bulk spam submissions. */
const MIN_SECONDS_BETWEEN_SUBMISSIONS = 60;

/**
 * Submit a prompt for review. Any signed-in user may submit; nothing goes
 * live until an admin approves it (status stays PENDING).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Sign in to submit a prompt" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const promptBody = String(body.body ?? "").trim();
  const outputType = String(body.outputType ?? "");

  if (title.length < 8) {
    return NextResponse.json(
      { error: "Give it a descriptive title (at least 8 characters)." },
      { status: 400 }
    );
  }
  if (promptBody.length < 40) {
    return NextResponse.json(
      { error: "The prompt looks too short to be useful (at least 40 characters)." },
      { status: 400 }
    );
  }
  if (!OUTPUT_TYPE_VALUES.includes(outputType as never)) {
    return NextResponse.json({ error: "Choose what this prompt makes." }, { status: 400 });
  }

  // Server-side enforcement: the UI hides pricing when disabled, but a
  // crafted request must not be able to create an unbuyable paid listing.
  const requestedPrice = Math.max(0, Math.round(Number(body.priceCents ?? 0)));
  const priceCents = siteConfig.paidPromptsEnabled ? requestedPrice : 0;
  if (!Number.isFinite(priceCents) || priceCents > MAX_PRICE_CENTS) {
    return NextResponse.json(
      { error: `Price must be between free and ${MAX_PRICE_CENTS / 100}.` },
      { status: 400 }
    );
  }

  const images = Array.isArray(body.images) ? (body.images as unknown[]) : [];
  if (images.length === 0) {
    return NextResponse.json(
      { error: "Add at least one example image so buyers can see the output." },
      { status: 400 }
    );
  }
  if (images.length > MAX_EXAMPLES) {
    return NextResponse.json(
      { error: `You can attach at most ${MAX_EXAMPLES} images.` },
      { status: 400 }
    );
  }

  const recent = await prisma.prompt.findFirst({
    where: {
      authorId: user.id,
      createdAt: { gt: new Date(Date.now() - MIN_SECONDS_BETWEEN_SUBMISSIONS * 1000) },
    },
    select: { id: true },
  });
  if (recent) {
    return NextResponse.json(
      { error: "You're submitting too quickly. Please wait a minute." },
      { status: 429 }
    );
  }

  let slug = generateSlug(title);
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
    (Array.isArray(body.tags) ? (body.tags as string[]) : []).slice(0, 8)
  );

  const prompt = await prisma.prompt.create({
    data: {
      title,
      slug,
      body: promptBody,
      negative: body.negative ? String(body.negative) : null,
      description: body.description ? String(body.description).slice(0, 500) : null,
      tips: body.tips ? sanitizeHtml(String(body.tips)) : null,
      kind: (body.kind as "IMAGE" | "VIDEO" | "TEXT") ?? "IMAGE",
      outputType: outputType as never,
      difficulty: (body.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED") ?? "BEGINNER",
      aspectRatio: body.aspectRatio ? String(body.aspectRatio) : null,
      parameters: body.parameters ? String(body.parameters) : null,
      priceCents,
      // PENDING, never PUBLISHED — a seller cannot put anything live directly.
      status: "PENDING",
      submittedAt: new Date(),
      authorId: user.id,
      modelId: model?.id ?? null,
      categoryId: category?.id ?? null,
      metaTitle: title,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
      examples: {
        create: images.slice(0, MAX_EXAMPLES).map((img, i) => {
          const o = img as Record<string, unknown>;
          return {
            url: String(o.url ?? ""),
            width: o.width ? Number(o.width) : null,
            height: o.height ? Number(o.height) : null,
            alt: title,
            order: i,
          };
        }),
      },
    },
    select: { id: true, slug: true, title: true, status: true },
  });

  return NextResponse.json(prompt, { status: 201 });
}
