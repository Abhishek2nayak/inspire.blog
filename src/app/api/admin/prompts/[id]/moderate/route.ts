import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { revalidatePrompts } from "@/api/revalidate";
import { getCurrentAdmin } from "@/lib/session";

/**
 * Approve or reject a submitted prompt.
 * Body: { action: "approve" | "reject", reason?: string }
 */
async function POSTHandler(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const action = String(body.action ?? "");
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: { _count: { select: { examples: true } } },
  });
  if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve") {
    // Same guard as the admin editor: nothing goes live without an example.
    if (prompt._count.examples === 0) {
      return NextResponse.json(
        { error: "This prompt has no example image — reject it or ask for one." },
        { status: 422 }
      );
    }
    const updated = await prisma.prompt.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: prompt.publishedAt ?? new Date(),
        approvedAt: new Date(),
        approvedById: admin.id,
        rejectionReason: null,
      },
    });
    revalidatePrompts(updated.slug);
    return NextResponse.json(updated);
  }

  if (action === "reject") {
    const reason = String(body.reason ?? "").trim();
    if (!reason) {
      return NextResponse.json(
        { error: "Give a reason — the seller sees it and can fix the prompt." },
        { status: 400 }
      );
    }
    const updated = await prisma.prompt.update({
      where: { id },
      data: { status: "REJECTED", rejectionReason: reason },
    });
    revalidatePrompts(updated.slug);
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
}

export const POST = withApiErrors(POSTHandler);
