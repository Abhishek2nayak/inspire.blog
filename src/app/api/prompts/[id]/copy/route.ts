import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";

/**
 * Increment a prompt's copy counter.
 *
 * Unauthenticated by design — copying is the core action and gating it behind
 * a login would kill the metric. It is a vanity/ranking signal, not billing,
 * so a little inflation is acceptable; failures are swallowed so the client
 * never surfaces an error for a counter.
 */
async function POSTHandler(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.prompt.update({
      where: { id },
      data: { copies: { increment: 1 } },
    });
  } catch {
    // Unknown id, or a race with a deletion. Nothing worth reporting.
    return NextResponse.json({ ok: false }, { status: 204 });
  }

  return NextResponse.json({ ok: true });
}

export const POST = withApiErrors(POSTHandler);
