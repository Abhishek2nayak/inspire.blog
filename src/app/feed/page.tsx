"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ArticleCard from "@/components/article/ArticleCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PostWithAuthor } from "@/types";
import { PenLine, BookOpen, Flame, Users, Clock } from "lucide-react";

type Tab = "for-you" | "following" | "latest" | "trending";

const tabs: { key: Tab; label: string; icon: React.ElementType; requiresAuth?: boolean }[] = [
  { key: "for-you", label: "For You", icon: BookOpen, requiresAuth: true },
  { key: "following", label: "Following", icon: Users, requiresAuth: true },
  { key: "latest", label: "Latest", icon: Clock },
  { key: "trending", label: "Trending", icon: Flame },
];

function ArticleSkeleton() {
  return (
    <div className="py-6 border-b border-border">
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
        </div>
        <Skeleton className="hidden sm:block w-28 h-28 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>(
    session ? "for-you" : "latest"
  );
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const { ref, inView } = useInView({ threshold: 0 });

  const fetchPosts = useCallback(
    async (pageNum: number, reset = false) => {
      setLoading(true);
      try {
        let url = "";
        if (activeTab === "for-you") {
          url = `/api/posts/feed?page=${pageNum}&limit=10`;
        } else if (activeTab === "following") {
          url = `/api/posts/feed?page=${pageNum}&limit=10&following=true`;
        } else if (activeTab === "trending") {
          url = `/api/posts?page=${pageNum}&limit=10&sort=trending`;
        } else {
          url = `/api/posts?page=${pageNum}&limit=10&sort=latest`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const newPosts: PostWithAuthor[] = data.posts || data;

        if (reset) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        setHasMore(newPosts.length === 10);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  // Fetch trending tags
  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setTrendingTags(data.slice(0, 12)))
      .catch(() => {});
  }, []);

  // Reset on tab change
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  }, [activeTab, fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  }, [inView, hasMore, loading, page, fetchPosts]);

  const visibleTabs = tabs.filter((t) => !t.requiresAuth || session);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-14">
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 border-b border-border mb-8 overflow-x-auto no-scrollbar">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap cursor-pointer",
                    activeTab === tab.key
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tag filter pills */}
          {trendingTags.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
              {trendingTags.map((tag) => (
                <Link key={tag.id} href={`/tag/${tag.slug}`} className="flex-shrink-0">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-foreground hover:text-background hover:border-foreground transition-colors whitespace-nowrap"
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Posts */}
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div>
              {[...Array(4)].map((_, i) => (
                <ArticleSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Infinite scroll trigger */}
          {hasMore && !loading && <div ref={ref} className="h-10" />}

          {/* End of feed */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                You&apos;ve read everything here
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Check back later for new stories
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && posts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <PenLine className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-serif font-bold text-foreground text-lg mb-2">
                Nothing here yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                {activeTab === "following"
                  ? "Follow some writers to see their latest posts here."
                  : "No posts found. Be the first to share something."}
              </p>
              <Link href="/editor/new">
                <Button className="bg-foreground text-background hover:opacity-90">
                  Write a story
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="lg:sticky lg:top-24 space-y-8">
            {/* Trending Tags */}
            {trendingTags.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Trending topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag) => (
                    <Link key={tag.id} href={`/tag/${tag.slug}`}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-foreground hover:text-background hover:border-foreground transition-colors font-normal"
                      >
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Writing CTA */}
            <div className="border border-border rounded-2xl p-6">
              <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center mb-4">
                <PenLine className="h-5 w-5 text-background" />
              </div>
              <h3 className="font-serif font-bold text-foreground mb-2">
                Share your knowledge
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Write about what you know. Reach readers around the world.
              </p>
              <Link href="/editor/new" className="block">
                <Button className="w-full bg-foreground text-background hover:opacity-90">
                  Start writing
                </Button>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
