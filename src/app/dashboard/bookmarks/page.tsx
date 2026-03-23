"use client";

import React, { useState, useEffect } from "react";
import ArticleCard from "@/components/article/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { PostWithAuthor } from "@/types";
import Link from "next/link";
import { Bookmark, BookOpen } from "lucide-react";

function ArticleSkeleton() {
  return (
    <div className="py-6 border-b border-border">
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="hidden sm:block w-28 h-28 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch("/api/posts?bookmarked=true");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data.posts || data);
    } catch {
      toast({
        title: "Failed to load bookmarks",
        description: "Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({ title: "Bookmark removed" });
    } catch {
      toast({
        title: "Failed to remove bookmark",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">
          Bookmarks
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Articles you&apos;ve saved for later
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div>
          {[...Array(4)].map((_, i) => (
            <ArticleSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-2xl">
          <div className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-serif font-semibold text-foreground mb-1">
            No bookmarks yet
          </h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
            When you save articles to read later, they&apos;ll appear here.
          </p>
          <Link href="/feed">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-1.5" />
              Explore articles
            </Button>
          </Link>
        </div>
      )}

      {/* Bookmarks List */}
      {!loading && posts.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground font-medium">
            {posts.length} saved {posts.length === 1 ? "article" : "articles"}
          </p>
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <div key={post.id} className="relative group/bookmark">
                <ArticleCard post={post} />
                <button
                  onClick={() => handleRemoveBookmark(post.id)}
                  className="absolute top-6 right-0 text-xs text-muted-foreground hover:text-destructive bg-background border border-border rounded-full px-3 py-1 opacity-0 group-hover/bookmark:opacity-100 transition-all cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
