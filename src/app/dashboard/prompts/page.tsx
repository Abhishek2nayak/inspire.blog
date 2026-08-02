import Link from "next/link";
import { Plus, ImageOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/utils";
import { getOutputTypeByValue } from "@/lib/prompts";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-chip-green text-chip-green-fg",
  DRAFT: "bg-muted text-muted-foreground",
  REVIEW: "bg-chip-yellow text-chip-yellow-fg",
  ARCHIVED: "bg-muted text-muted-foreground line-through",
};

export default async function DashboardPromptsPage() {
  const prompts = await prisma.prompt.findMany({
    include: {
      model: { select: { name: true } },
      _count: { select: { examples: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Prompts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {prompts.length} total ·{" "}
            {prompts.filter((p) => p.status === "PUBLISHED").length} published
          </p>
        </div>
        <Link
          href="/dashboard/prompts/new"
          className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-lime px-3.5 py-2 text-sm font-semibold text-ink shadow-[2px_2px_0_0_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-lime-deep hover:shadow-none"
        >
          <Plus className="h-4 w-4" />
          New prompt
        </Link>
      </div>

      {prompts.length === 0 ? (
        <div className="rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
          <p className="font-display text-lg font-bold text-foreground">No prompts yet</p>
          <Link
            href="/dashboard/prompts/new"
            className="mt-1 inline-block text-sm text-link hover:underline"
          >
            Create the first one
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-semibold">Title</th>
                <th className="pb-2 font-semibold">Making</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 font-semibold">Copies</th>
                <th className="pb-2 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {prompts.map((p) => {
                const output = getOutputTypeByValue(p.outputType);
                const needsImage = p._count.examples === 0;
                return (
                  <tr key={p.id} className="align-middle">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/dashboard/prompts/${p.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {p.title}
                      </Link>
                      {/* Surfaced here because it is the one thing that blocks publishing. */}
                      {needsImage && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-sm bg-chip-coral px-1.5 py-0.5 text-[10px] font-semibold text-chip-coral-fg">
                          <ImageOff className="h-3 w-3" />
                          needs example
                        </span>
                      )}
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {p.model?.name ?? "no model"}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {output?.short ?? p.outputType}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={cn(
                          "rounded-sm px-1.5 py-0.5 text-[11px] font-semibold",
                          STATUS_STYLE[p.status]
                        )}
                      >
                        {p.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {formatNumber(p.copies)}
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {formatDate(p.updatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
