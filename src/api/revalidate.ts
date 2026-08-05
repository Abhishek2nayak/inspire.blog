import { revalidatePath, revalidateTag } from "next/cache";
import { TAGS } from "./cache-tags";

/**
 * Cache invalidation for content writes.
 *
 * WHY revalidatePath AND NOT revalidateTag HERE: they bust different things.
 *
 *   - revalidateTag  clears unstable_cache entries. In this app the only
 *     tagged caches are the AI-model and category lookups in src/api/, and
 *     publishing a prompt does not change either of those lists — so tagging
 *     content writes would be a no-op that reads like it works.
 *   - revalidatePath clears a route's ISR output. The `export const revalidate`
 *     pages query Prisma directly, so a *path* is the only thing that reaches
 *     them.
 *
 * Passing "page" as the second argument lets a dynamic route be busted by its
 * pattern ("/prompts/[slug]"), clearing every generated instance. That is
 * blunter than clearing one slug, but it is the only way to also catch the
 * listing and pillar pages that embed the changed row — and a content edit is
 * rare enough that over-invalidating costs nothing.
 *
 * Safe to call from route handlers only; calling these during a render throws.
 */

/** A prompt was created, edited, published, moderated or deleted. */
export function revalidatePrompts(slug?: string) {
  revalidatePath("/"); // homepage featured grid + free-prompt count
  revalidatePath("/prompts");
  revalidatePath("/prompts/for/[output]", "page");
  revalidatePath("/models/[slug]", "page");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/tag/[slug]", "page");
  if (slug) revalidatePath(`/prompts/${slug}`);
  else revalidatePath("/prompts/[slug]", "page");
}

/** A tool was created, edited or deleted. */
export function revalidateTools(slug?: string) {
  revalidatePath("/");
  revalidatePath("/tools");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/tag/[slug]", "page");
  if (slug) revalidatePath(`/tools/${slug}`);
  else revalidatePath("/tools/[slug]", "page");
}

/** An article was created, edited, published or deleted. */
export function revalidateArticles(slug?: string) {
  revalidatePath("/");
  revalidatePath("/tutorials");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/tag/[slug]", "page");
  if (slug) revalidatePath(`/article/${slug}`);
  else revalidatePath("/article/[slug]", "page");
}

/**
 * The AI-model or category *lists* changed — i.e. a seed re-run, not a content
 * edit. This is the one place the tags in ./cache-tags.ts are actually used.
 *
 * Next 16 requires a cache-life profile as the second argument; "max" purges
 * the entry outright rather than scheduling a soft refresh, which is what you
 * want after a re-seed.
 */
export function revalidateLookups() {
  revalidateTag(TAGS.aiModels, "max");
  revalidateTag(TAGS.categories, "max");
}
