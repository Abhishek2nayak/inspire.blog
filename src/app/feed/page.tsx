"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ArticleCard from "@/components/article/ArticleCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import type { PostWithAuthor } from "@/types";
import {
  Home,
  BookOpen,
  User,
  FileText,
  List,
  Users,
  PenLine,
  Flame,
  Clock,
  Plus,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Tab = "for-you" | "following" | "latest" | "trending";

interface TagItem {
  id: string;
  name: string;
  slug: string;
}

interface StaffPick {
  id: string;
  slug: string;
  title: string;
  readTime: number;
  publishedAt: string | null;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null };
  tags: { tag: TagItem }[];
}

interface SuggestedAuthor {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  _count: { posts: number; followers: number };
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function ArticleSkeleton() {
  return (
    <div className="py-6 border-b border-border">
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-3 pt-1 items-center">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>
        <Skeleton className="hidden sm:block w-28 h-28 rounded-xl flex-shrink-0" />
      </div>
    </div>
  );
}

/* ─── Left Sidebar Nav ───────────────────────────────────────────────────── */
function LeftNav({ session }: { session: { user?: { name?: string | null; image?: string | null } } | null }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/dashboard", icon: BookOpen, label: "Library" },
    ...(session
      ? [
          { href: `/profile/me`, icon: User, label: "Profile" },
          { href: "/dashboard", icon: FileText, label: "Stories" },
          { href: "/dashboard?tab=bookmarks", icon: List, label: "Lists" },
        ]
      : []),
    { href: "/feed?tab=following", icon: Users, label: "Following" },
  ];

  return (
    <nav className="hidden lg:flex flex-col gap-1 w-56 shrink-0 pt-1">
      {navItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
            pathname === href
              ? "text-foreground bg-muted"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}

      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href="/editor/new"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <PenLine className="h-4 w-4 shrink-0" />
          Write
        </Link>
      </div>

      {session?.user && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Your account
          </p>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Avatar className="h-7 w-7">
              {session.user.image && (
                <AvatarImage src={session.user.image} alt={session.user.name || ""} />
              )}
              <AvatarFallback className="text-[10px]">
                {getInitials(session.user.name || "U")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground line-clamp-1">
              {session.user.name}
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Right Sidebar ──────────────────────────────────────────────────────── */
function RightSidebar({
  staffPicks,
  tags,
  suggestedAuthors,
  loading,
}: {
  staffPicks: StaffPick[];
  tags: TagItem[];
  suggestedAuthors: SuggestedAuthor[];
  loading: boolean;
}) {
  return (
    <aside className="hidden xl:flex flex-col gap-8 w-80 shrink-0 pt-1">

      {/* Staff Picks */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-4">Staff Picks</h3>
        <div className="space-y-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))
            : staffPicks.map((post) => (
                <div key={post.id} className="group">
                  <Link href={`/profile/${post.author.id}`} className="flex items-center gap-2 mb-1.5">
                    <Avatar className="h-6 w-6">
                      {post.author.image && (
                        <AvatarImage src={post.author.image} alt={post.author.name || ""} />
                      )}
                      <AvatarFallback className="text-[8px]">
                        {getInitials(post.author.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-foreground">
                      {post.author.name}
                    </span>
                  </Link>
                  <Link href={`/article/${post.slug}`}>
                    <p className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:opacity-60 transition-opacity">
                      {post.title}
                    </p>
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {post.readTime} min read
                    {post.tags[0] && (
                      <>
                        {" · "}
                        <Link
                          href={`/tag/${post.tags[0].tag.slug}`}
                          className="hover:text-foreground transition-colors"
                        >
                          {post.tags[0].tag.name}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
              ))}
        </div>
        {staffPicks.length > 0 && (
          <Link
            href="/feed?tab=trending"
            className="mt-4 inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            See the full list
          </Link>
        )}
      </div>

      {/* Recommended Topics */}
      {tags.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Recommended topics</h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 12).map((tag) => (
              <Link key={tag.id} href={`/tag/${tag.slug}`}>
                <Badge
                  variant="secondary"
                  className="rounded-full text-xs font-medium cursor-pointer hover:bg-foreground hover:text-background transition-colors px-3 py-1"
                >
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
          <Link
            href="/feed"
            className="mt-3 inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            See more topics
          </Link>
        </div>
      )}

      {/* Who to Follow */}
      {suggestedAuthors.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-4">Who to follow</h3>
          <div className="space-y-4">
            {suggestedAuthors.map((author) => (
              <div key={author.id} className="flex items-start gap-3">
                <Link href={`/profile/${author.id}`}>
                  <Avatar className="h-9 w-9 shrink-0">
                    {author.image && (
                      <AvatarImage src={author.image} alt={author.name || ""} />
                    )}
                    <AvatarFallback className="text-xs">
                      {getInitials(author.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${author.id}`}>
                    <p className="text-sm font-semibold text-foreground truncate hover:opacity-70 transition-opacity">
                      {author.name}
                    </p>
                  </Link>
                  {author.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {author.bio}
                    </p>
                  )}
                </div>
                <button
                  onClick={async () => {
                    try {
                      await fetch(`/api/users/${author.id}/follow`, { method: "POST" });
                    } catch {}
                  }}
                  className="shrink-0 rounded-full border border-foreground px-3 py-1 text-xs font-semibold text-foreground hover:bg-foreground hover:text-background transition-colors"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
          <Link
            href="/feed?tab=following"
            className="mt-4 inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            See more suggestions
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        {["Help", "About", "Privacy", "Terms", "Advertise"].map((l) => (
          <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
        ))}
        <span className="w-full text-[10px] opacity-50 mt-1">
          © {new Date().getFullYear()} Inspire.blog
        </span>
      </div>
    </aside>
  );
}

/* ─── Main Feed Page ─────────────────────────────────────────────────────── */
const tabs: { key: Tab; label: string; requiresAuth?: boolean }[] = [
  { key: "for-you", label: "For you", requiresAuth: true },
  { key: "following", label: "Following", requiresAuth: true },
  { key: "latest", label: "Latest" },
  { key: "trending", label: "Trending" },
];

export default function FeedPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("latest");
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  // Sidebar data
  const [trendingTags, setTrendingTags] = useState<TagItem[]>([]);
  const [staffPicks, setStaffPicks] = useState<StaffPick[]>([]);
  const [suggestedAuthors, setSuggestedAuthors] = useState<SuggestedAuthor[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  const { ref, inView } = useInView({ threshold: 0 });

  // Set default tab based on auth
  useEffect(() => {
    if (session) setActiveTab("for-you");
  }, [session]);

  const fetchPosts = useCallback(
    async (pageNum: number, reset = false) => {
      setLoading(true);
      try {
        let url = "";
        if (activeTab === "for-you") url = `/api/posts/feed?page=${pageNum}&limit=10`;
        else if (activeTab === "following") url = `/api/posts/feed?page=${pageNum}&limit=10&following=true`;
        else if (activeTab === "trending") url = `/api/posts?page=${pageNum}&limit=10&sort=trending`;
        else url = `/api/posts?page=${pageNum}&limit=10&sort=latest`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const newPosts: PostWithAuthor[] = data.posts || data;

        if (reset) setPosts(newPosts);
        else setPosts((prev) => [...prev, ...newPosts]);

        setHasMore(newPosts.length === 10);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  // Fetch sidebar data once
  useEffect(() => {
    setSidebarLoading(true);
    Promise.all([
      fetch("/api/tags").then((r) => r.json()).catch(() => []),
      fetch("/api/posts?limit=5&sort=trending").then((r) => r.json()).catch(() => ({ posts: [] })),
      fetch("/api/users/suggested").then((r) => r.json()).catch(() => []),
    ]).then(([tagsData, postsData, authorsData]) => {
      setTrendingTags(Array.isArray(tagsData) ? tagsData.slice(0, 15) : []);
      setStaffPicks(Array.isArray(postsData) ? postsData.slice(0, 5) : (postsData?.posts ?? []).slice(0, 5));
      setSuggestedAuthors(Array.isArray(authorsData) ? authorsData.slice(0, 4) : []);
    }).finally(() => setSidebarLoading(false));
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1272px] px-4 sm:px-6">
        <div className="flex gap-6 xl:gap-10 pt-8 pb-16">

          {/* ── Left nav ── */}
          <LeftNav session={session} />

          {/* ── Main feed ── */}
          <main className="flex-1 min-w-0">

            {/* Tab bar */}
            <div className="flex items-center border-b border-border overflow-x-auto no-scrollbar mb-0">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 cursor-pointer",
                    activeTab === tab.key
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}

              {/* Tag pills row in the same bar */}
              {trendingTags.length > 0 && (
                <div className="ml-4 flex gap-2 overflow-x-auto no-scrollbar flex-1">
                  {trendingTags.map((tag) => (
                    <Link key={tag.id} href={`/tag/${tag.slug}`} className="shrink-0">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-foreground hover:text-background transition-colors whitespace-nowrap">
                        {tag.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              <button className="ml-2 shrink-0 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Posts */}
            <div>
              {posts.map((post) => (
                <MediumArticleCard key={post.id} post={post} />
              ))}
            </div>

            {/* Loading skeletons */}
            {loading && Array.from({ length: 4 }).map((_, i) => <ArticleSkeleton key={i} />)}

            {/* Infinite scroll trigger */}
            {hasMore && !loading && <div ref={ref} className="h-10" />}

            {/* End of feed */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">You've read everything</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Check back later for new stories</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && posts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenLine className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">Nothing here yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  {activeTab === "following"
                    ? "Follow some writers to see their stories here."
                    : "No stories found. Be the first to share something."}
                </p>
                <Link
                  href="/editor/new"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-80 transition-opacity"
                >
                  <PenLine className="h-4 w-4" />
                  Write a story
                </Link>
              </div>
            )}
          </main>

          {/* ── Right sidebar ── */}
          <RightSidebar
            staffPicks={staffPicks}
            tags={trendingTags}
            suggestedAuthors={suggestedAuthors}
            loading={sidebarLoading}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Medium-style Article Card ──────────────────────────────────────────── */
function MediumArticleCard({ post }: { post: PostWithAuthor }) {
  const [bookmarked, setBookmarked] = useState(false);
  const excerpt = post.excerpt || stripHtml(post.content, 140);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    setBookmarked((b) => !b);
    try {
      await fetch(`/api/posts/${post.id}/bookmark`, { method: "POST" });
    } catch {
      setBookmarked((b) => !b);
    }
  };

  const primaryTag = post.tags[0]?.tag;

  return (
    <article className="py-6 border-b border-border group">
      {/* Author + meta */}
      <div className="flex items-center gap-2 mb-3">
        <Link href={`/profile/${post.author.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar className="h-6 w-6">
            {post.author.image && <AvatarImage src={post.author.image} alt={post.author.name || ""} />}
            <AvatarFallback className="text-[9px] bg-muted font-medium">
              {getInitials(post.author.name || "U")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">{post.author.name}</span>
        </Link>
        {primaryTag && (
          <>
            <span className="text-muted-foreground/40 text-sm">in</span>
            <Link
              href={`/tag/${primaryTag.slug}`}
              className="text-sm font-medium text-foreground hover:underline underline-offset-2"
            >
              {primaryTag.name}
            </Link>
          </>
        )}
        <span className="text-muted-foreground/40">·</span>
        <span className="text-sm text-muted-foreground">
          {formatRelativeDate(post.publishedAt ?? post.createdAt)}
        </span>
      </div>

      {/* Content row */}
      <div className="flex gap-6 sm:gap-8">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <Link href={`/article/${post.slug}`}>
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:opacity-70 transition-opacity">
              {post.title}
            </h2>
          </Link>

          {/* Excerpt */}
          <Link href={`/article/${post.slug}`} className="hidden sm:block">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {excerpt}
            </p>
          </Link>

          {/* Stats row */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime} min read
              </span>
              <button
                aria-label="Like"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Heart className="h-3.5 w-3.5" />
                {post._count.likes > 0 ? post._count.likes : ""}
              </button>
              <button
                aria-label="Comment"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {post._count.comments > 0 ? post._count.comments : ""}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleBookmark}
                aria-label={bookmarked ? "Remove bookmark" : "Save"}
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  bookmarked
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
              </button>
              <button
                aria-label="More options"
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        {post.coverImage && (
          <Link href={`/article/${post.slug}`} className="shrink-0 self-start mt-1">
            <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden bg-muted">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function stripHtml(html: string, maxLen = 160): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
}

function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
