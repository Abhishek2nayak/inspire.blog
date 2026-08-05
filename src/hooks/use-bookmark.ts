"use client";

import { useMutation } from "@tanstack/react-query";
import { describeApiError } from "@/lib/api-error";

export type BookmarkKind = "ARTICLE" | "PROMPT" | "TOOL";

/**
 * Toggle a bookmark.
 *
 * POST /api/bookmarks costs 2–3 DB operations per call (findFirst, then create
 * or delete), so the useMutation wrapper is not just tidiness: `isPending`
 * gates the button, which stops an impatient double-click from firing two
 * toggles that race and land on the wrong final state.
 *
 * Deliberately NOT invalidating a query on success — /saved is a server
 * component with its own ISR cache, not React Query state, so there is nothing
 * here to invalidate. It re-reads on next navigation.
 */
export function useToggleBookmark() {
  return useMutation({
    mutationFn: async (vars: { kind: BookmarkKind; id: string }): Promise<boolean> => {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vars),
      });
      if (!res.ok) throw new Error(await describeApiError(res));
      const data = await res.json();
      return Boolean(data.saved);
    },
  });
}
