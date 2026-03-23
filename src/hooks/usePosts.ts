"use client";

import { useState, useCallback } from "react";
import type { FeedPost } from "@/types";

interface UsePostsOptions {
  sort?: "latest" | "trending" | "feed";
  tag?: string;
  limit?: number;
}

export function usePosts({ sort = "latest", tag, limit = 10 }: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sort,
        page: String(pageNum),
        limit: String(limit),
        ...(tag && { tag }),
      });

      const endpoint = sort === "feed" ? "/api/posts/feed" : "/api/posts";
      const res = await fetch(`${endpoint}?${params}`);
      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      const newPosts: FeedPost[] = data.posts || data;

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === limit);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [sort, tag, limit, loading]);

  const loadMore = useCallback(() => {
    fetchPosts(page + 1);
  }, [fetchPosts, page]);

  const refresh = useCallback(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  return { posts, loading, error, hasMore, loadMore, refresh, fetchPosts };
}
