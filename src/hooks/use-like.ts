"use client";

import { useMutation } from "@tanstack/react-query";
import { describeApiError } from "@/lib/api-error";

/**
 * Toggle a prompt like. Mirrors use-bookmark.ts's useToggleBookmark shape —
 * see that file's comment for why this is wrapped in useMutation rather than
 * a bare fetch (isPending gates the button against a double-click race).
 */
export function useToggleLike() {
  return useMutation({
    mutationFn: async (promptId: string): Promise<{ liked: boolean; likeCount: number }> => {
      const res = await fetch(`/api/prompts/${promptId}/like`, { method: "POST" });
      if (!res.ok) throw new Error(await describeApiError(res));
      return res.json();
    },
  });
}
