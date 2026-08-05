import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TAGS } from "./cache-tags";

/** The shape the filter bars actually consume. */
export type ModelOption = { slug: string; name: string };

/**
 * The AI model list, cached across requests and shared by /prompts, /tools
 * and /sell — three pages that were each running this same lookup.
 *
 * `select` and `orderBy` are deliberate: without the select this pulls every
 * column (blurb, url, vendor, timestamps) to render a dropdown that uses two
 * of them, and without the orderBy the filter options come back in whatever
 * order Postgres feels like, which reshuffles the UI between deploys.
 */
const load = unstable_cache(
  async (): Promise<ModelOption[]> =>
    prisma.aiModel.findMany({
      orderBy: { order: "asc" },
      select: { slug: true, name: true },
    }),
  ["ai-models:options"],
  {
    // Tagged, not `revalidate: Infinity`. An untagged infinite cache means a
    // re-seeded model list never appears in the UI again without a redeploy.
    tags: [TAGS.aiModels],
    revalidate: 86400,
  }
);

/**
 * ERROR HANDLING — this answers the question left in src/app/prompts/page.tsx.
 *
 * The try/catch is deliberately OUTSIDE the cached function, and that ordering
 * is the whole point. unstable_cache stores whatever its callback returns, so
 * catching inside and returning [] would persist the empty array for the full
 * 24h TTL — one blip while Neon is scaled to zero and the filter bar stays
 * broken for a day. Letting the error escape the cache boundary means nothing
 * is written, and the next request retries against the database.
 *
 * Returning [] rather than rethrowing is the right trade here: the filter bar
 * is a navigation aid, so a page that renders with fewer filter options beats
 * a page that 500s. This mirrors lib/safe-query.ts, which exists for the same
 * reason on the prerender path.
 */
export async function getAiModels(): Promise<ModelOption[]> {
  try {
    return await load();
  } catch (error) {
    console.warn("[api/aimodels] lookup failed, rendering without model filters:", error);
    return [];
  }
}
