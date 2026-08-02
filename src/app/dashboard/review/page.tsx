import { prisma } from "@/lib/prisma";
import ModerationQueue, { type PendingPrompt } from "@/components/dashboard/ModerationQueue";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  const pending = await prisma.prompt.findMany({
    where: { status: "PENDING" },
    include: {
      author: { select: { name: true, email: true } },
      model: { select: { name: true } },
      examples: { orderBy: { order: "asc" }, select: { id: true, url: true } },
    },
    orderBy: { submittedAt: "asc" },
  });

  const initial: PendingPrompt[] = pending.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    body: p.body,
    description: p.description,
    outputType: p.outputType,
    priceCents: p.priceCents,
    currency: p.currency,
    submittedAt: p.submittedAt?.toISOString() ?? null,
    author: p.author,
    model: p.model,
    examples: p.examples,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Review queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {initial.length} prompt{initial.length === 1 ? "" : "s"} waiting. Nothing here is
          public until you approve it.
        </p>
      </div>
      <ModerationQueue initial={initial} />
    </div>
  );
}
