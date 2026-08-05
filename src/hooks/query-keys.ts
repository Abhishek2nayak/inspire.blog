/**
 * Central query-key vocabulary.
 *
 * Keys live here rather than inline at each call site because the whole
 * benefit of the cache depends on two components asking for the same data with
 * the *identical* key. /dashboard/posts and /dashboard/analytics both read the
 * admin's own articles; written by hand they drifted into two keys and two
 * fetches of the same rows. Sharing `articles.mine()` makes the second page
 * free.
 *
 * Keys are hierarchical, so a prefix invalidates everything beneath it:
 *   invalidateQueries({ queryKey: queryKeys.articles.all })
 * clears both the list and every cached detail.
 */
export const queryKeys = {
  articles: {
    all: ["articles"] as const,
    /**
     * Note `includeDrafts` is part of the key: the drafts and published-only
     * responses are genuinely different result sets, and collapsing them into
     * one key would show drafts on the analytics page.
     */
    mine: (includeDrafts: boolean) => ["articles", "mine", { includeDrafts }] as const,
    detail: (id: string) => ["articles", "detail", id] as const,
  },
  profile: ["profile"] as const,
} as const;
