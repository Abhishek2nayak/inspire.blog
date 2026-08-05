import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { promptCardInclude, PUBLISHED, JOIN } from "@/lib/queries";
import type { PromptCard as PromptCardData } from "@/lib/queries";
import { safeQuery } from "@/lib/safe-query";
import { getOutputType } from "@/lib/prompts";
import PromptCard from "./PromptCard";

/**
 * The results grid, isolated so it can suspend on its own.
 *
 * Previously the whole /prompts page re-rendered on every filter click, which
 * meant loading.tsx blanked the hero and the filter bar too — the filters you
 * just clicked would disappear. Keeping the query in here lets the page shell
 * stay mounted and only this part swap.
 */
export default async function PromptResults({
  outputSlug,
  modelSlug,
  categorySlug,
  difficulty,
  price,
  sort,
}: {
  outputSlug?: string;
  modelSlug?: string;
  categorySlug?: string;
  difficulty?: string;
  price?: string;
  sort?: string;
}) {
  const output = outputSlug ? getOutputType(outputSlug) : undefined;

  const where: Prisma.PromptWhereInput = {
    ...PUBLISHED,
    ...(output ? { outputType: output.value } : {}),
    ...(modelSlug ? { model: { slug: modelSlug } } : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(difficulty && ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(difficulty)
      ? { difficulty: difficulty as Prisma.EnumDifficultyFilter["equals"] }
      : {}),
    ...(price === "free" ? { priceCents: 0 } : {}),
    ...(price === "paid" ? { priceCents: { gt: 0 } } : {}),
  };

  const orderBy: Prisma.PromptOrderByWithRelationInput =
    sort === "popular"
      ? { copies: "desc" }
      : sort === "bestselling"
        ? { sales: "desc" }
        : { publishedAt: "desc" };

  // safeQuery because /prompts prerenders its shell — see app/page.tsx.
  const prompts = await safeQuery(
    () =>
      prisma.prompt.findMany({
        ...JOIN,
        where,
        include: promptCardInclude,
        orderBy,
        take: 60,
      }),
    [] as PromptCardData[]
  );

  if (prompts.length === 0) {
    return (
      <div className="mt-8 rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
        <p className="font-display text-lg font-bold text-foreground">
          Nothing matches those filters
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try removing one, or{" "}
          <Link href="/prompts" className="text-link hover:underline">
            browse everything
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mt-6 text-sm text-muted-foreground">
        {prompts.length} prompt{prompts.length === 1 ? "" : "s"}
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((p) => (
          <PromptCard key={p.id} prompt={p} featured={p.featured} />
        ))}
      </div>
    </>
  );
}
