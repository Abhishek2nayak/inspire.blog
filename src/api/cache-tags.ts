/**
 * Cache tag vocabulary, shared by the readers in this directory and the
 * writers in src/app/api/admin/**.
 *
 * These strings are the contract between "this page is cached for an hour"
 * and "an editor just hit publish". Without them a long `revalidate` means an
 * edit is invisible until the window expires; with them, a write calls
 * revalidateTag() and every cached surface holding that tag rebuilds on the
 * next request. That is what makes the aggressive TTLs elsewhere safe.
 *
 * Keep them here rather than inline so a typo is a compile error, not a
 * silently-never-invalidated page.
 */
export const TAGS = {
  prompts: "prompts",
  tools: "tools",
  articles: "articles",
  aiModels: "ai-models",
  categories: "categories",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];
