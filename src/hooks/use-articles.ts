"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import { describeApiError } from "@/lib/api-error";

/** Mirrors what GET /api/articles returns (articleCardInclude). */
export interface DashboardArticle {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  views: number;
  readTime: number;
  _count: { comments: number; bookmarks: number };
}

async function fetchMyArticles(includeDrafts: boolean): Promise<DashboardArticle[]> {
  const qs = includeDrafts ? "?mine=true&include_drafts=true" : "?mine=true";
  const res = await fetch(`/api/articles${qs}`);
  if (!res.ok) throw new Error(await describeApiError(res));

  const data = await res.json();
  // The API returns { articles: [...] }. Guard with Array.isArray rather than
  // `data.articles || data` — if the shape ever changes again this yields an
  // empty list instead of throwing "filter is not a function" mid-render.
  return Array.isArray(data?.articles) ? data.articles : [];
}

/**
 * The admin's own articles.
 *
 * Shared by /dashboard/posts (with drafts) and /dashboard/analytics (without).
 * Within staleTime, navigating between those two pages costs no request at all
 * — previously each mount re-queried the table.
 */
export function useMyArticles(includeDrafts: boolean) {
  return useQuery({
    queryKey: queryKeys.articles.mine(includeDrafts),
    queryFn: () => fetchMyArticles(includeDrafts),
  });
}

async function fetchArticle<T>(id: string): Promise<T> {
  const res = await fetch(`/api/articles/${id}`);
  if (!res.ok) throw new Error(await describeApiError(res));
  const data = await res.json();
  // The route has returned both `{ post }` and a bare article at different
  // points; accept either rather than coupling the editor to one of them.
  return (data.post ?? data) as T;
}

/**
 * A single article for the editor.
 *
 * Generic over the caller's shape: the editor's PostData is a looser view than
 * the API's full row, and the hook has no business asserting which is correct.
 */
export function useArticle<T = unknown>(id: string, enabled = true) {
  return useQuery<T>({
    queryKey: queryKeys.articles.detail(id),
    queryFn: () => fetchArticle<T>(id),
    enabled,
  });
}

/**
 * Delete an article.
 *
 * Invalidates the `articles` prefix rather than hand-splicing the row out of
 * local state, so the list, the drafts view and the analytics totals all
 * reconcile from one source instead of drifting apart.
 */
export function useDeleteArticle() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await describeApiError(res));
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.articles.all });
    },
  });
}
