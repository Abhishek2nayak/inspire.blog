import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TAGS } from "./cache-tags";

/** The shape the filter bars actually consume. */
export type CategoryOption = { slug: string; name: string };

/**
 * The category list, cached across requests. Same reasoning as ./aimodels.ts:
 * scoped `select`, explicit `orderBy`, tagged so a re-seed actually shows up.
 *
 * Note this is the DB-backed Category table, which is not the same thing as
 * CLUSTERS in lib/categories.ts. CLUSTERS is the code-side source of truth for
 * the pillar pages and needs no query at all; this list exists so the filter
 * bar only offers categories that have rows behind them.
 */
const load = unstable_cache(
  async (): Promise<CategoryOption[]> =>
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { slug: true, name: true },
    }),
  ["categories:options"],
  { tags: [TAGS.categories], revalidate: 86400 }
);

/** See the error-handling note in ./aimodels.ts — the catch is outside the cache on purpose. */
export async function getCategories(): Promise<CategoryOption[]> {
  try {
    return await load();
  } catch (error) {
    console.warn("[api/categories] lookup failed, rendering without category filters:", error);
    return [];
  }
}
