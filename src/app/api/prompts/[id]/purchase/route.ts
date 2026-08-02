import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { splitPrice } from "@/lib/prompt-access";

/**
 * Purchase a paid prompt.
 *
 * PAYMENTS ARE NOT WIRED YET. This deliberately returns 501 rather than
 * silently marking a purchase COMPLETED — granting access without taking
 * money would be worse than not working at all, and much harder to notice.
 *
 * The row is still written as PENDING so the split is recorded and the
 * checkout flow can be tested end to end. When Stripe is added, the webhook
 * flips PENDING -> COMPLETED and that is the only change needed here.
 */
async function POSTHandler(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Sign in to buy this prompt" }, { status: 401 });
  }

  const prompt = await prisma.prompt.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      priceCents: true,
      currency: true,
      platformFeePercent: true,
      authorId: true,
    },
  });

  if (!prompt || prompt.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }
  if (prompt.priceCents <= 0) {
    return NextResponse.json({ error: "This prompt is free" }, { status: 400 });
  }
  if (prompt.authorId === user.id) {
    return NextResponse.json({ error: "This is your own prompt" }, { status: 400 });
  }

  const existing = await prisma.purchase.findUnique({
    where: { userId_promptId: { userId: user.id, promptId: id } },
    select: { status: true },
  });
  if (existing?.status === "COMPLETED") {
    return NextResponse.json({ ok: true, alreadyOwned: true });
  }

  const { platformFeeCents, sellerEarnsCents } = splitPrice(
    prompt.priceCents,
    prompt.platformFeePercent
  );

  await prisma.purchase.upsert({
    where: { userId_promptId: { userId: user.id, promptId: id } },
    update: { status: "PENDING" },
    create: {
      userId: user.id,
      promptId: id,
      pricePaidCents: prompt.priceCents,
      platformFeeCents,
      sellerEarnsCents,
      currency: prompt.currency,
      status: "PENDING",
    },
  });

  return NextResponse.json(
    {
      error:
        "Checkout isn't connected yet. Your interest is recorded — payments go live once Stripe is set up.",
      pending: true,
    },
    { status: 501 }
  );
}

export const POST = withApiErrors(POSTHandler);
