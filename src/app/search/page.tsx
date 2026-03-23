"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, Clock, Hash, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { FeedPost } from "@/types";
import ArticleCard from "@/components/article/ArticleCard";

const RECENT_SEARCHES_KEY = "blogosphere_recent_searches";
const MAX_RECENT = 5;

const POPULAR_TAGS = [
  "Technology",
  "Programming",
  "AI & ML",
  "Web Development",
  "Design",
  "Productivity",
  "Open Source",
  "Startups",
];

function ArticleCardSkeleton() {
  return (
    <div className="py-6 border-b border-border">
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="hidden sm:block h-28 w-28 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setSearched(false);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data.posts || data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    };

    performSearch();

    // Update URL without navigation
    const params = new URLSearchParams();
    params.set("q", debouncedQuery);
    window.history.replaceState(null, "", `/search?${params}`);
  }, [debouncedQuery]);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((s) => s !== term)].slice(
        0,
        MAX_RECENT
      );
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    setShowRecent(false);
    inputRef.current?.blur();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const handleTagClick = (tag: string) => {
    router.push(`/tag/${tag.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Search Articles
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover stories, ideas, and perspectives
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 200)}
            placeholder="Search articles, topics, authors..."
            className="w-full rounded-2xl border border-border bg-background py-4 pl-12 pr-12 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Recent searches dropdown */}
        {showRecent && !query && recentSearches.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border border-border bg-popover shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Recent Searches
              </span>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            </div>
            <ul className="py-1">
              {recentSearches.map((term, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleRecentClick(term)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>

      {/* Loading state */}
      {loading && (
        <div className="space-y-0">
          {[1, 2, 3].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && searched && query && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.length > 0
                ? `${results.length} result${results.length !== 1 ? "s" : ""} for `
                : "No results for "}
              <span className="font-medium text-foreground">
                &ldquo;{debouncedQuery}&rdquo;
              </span>
            </p>
          </div>

          {results.length > 0 ? (
            <div>
              {results.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/30 py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                No results found
              </h2>
              <p className="mb-1 text-muted-foreground">
                We couldn&apos;t find anything for &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="text-sm text-muted-foreground">
                Try different keywords or browse by topic below
              </p>
            </div>
          )}
        </>
      )}

      {/* Popular tags — shown when no query */}
      {!query && !loading && (
        <div className="mt-4">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Popular Topics
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <Hash className="h-3.5 w-3.5" />
                {tag}
              </button>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              What to read today?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-1 items-start text-left"
                onClick={() => router.push("/feed")}
              >
                <span className="font-semibold text-foreground">Your Feed</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Personalized articles from authors you follow
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-1 items-start text-left"
                onClick={() => router.push("/")}
              >
                <span className="font-semibold text-foreground">Trending Now</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Most popular articles this week
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-12"><div className="h-12 bg-muted rounded-full animate-pulse mb-8" /><div className="space-y-6">{[1,2,3].map(i=><div key={i} className="h-32 bg-muted rounded-xl animate-pulse"/>)}</div></div>}>
      <SearchPageInner />
    </Suspense>
  );
}
