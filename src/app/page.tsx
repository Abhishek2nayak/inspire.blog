export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { PostWithAuthor } from "@/types";
import { formatDate, getInitials, getExcerpt } from "@/lib/utils";
import { TrendingUp, Clock, Heart, MessageCircle, ArrowRight, Bookmark, PenLine } from "lucide-react";

const postInclude = {
  author: { select: { id: true, name: true, image: true, bio: true } },
  tags: { include: { tag: true } },
  _count: { select: { likes: true, comments: true, bookmarks: true } },
};

async function getLatestPosts(): Promise<PostWithAuthor[]> {
  return prisma.post.findMany({
    where: { published: true },
    include: postInclude,
    orderBy: { publishedAt: "desc" },
    take: 12,
  }) as unknown as PostWithAuthor[];
}

async function getTrendingPosts(): Promise<PostWithAuthor[]> {
  return prisma.post.findMany({
    where: { published: true },
    include: postInclude,
    orderBy: { views: "desc" },
    take: 5,
  }) as unknown as PostWithAuthor[];
}

async function getTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
    take: 25,
  });
}

export default async function HomePage() {
  const [latest, trending, tags] = await Promise.all([
    getLatestPosts(),
    getTrendingPosts(),
    getTags(),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex gap-8 xl:gap-12">

          {/* ── Main feed ── */}
          <div className="flex-1 min-w-0">

            {/* Feed header */}
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground">Latest articles</h1>
              <Link
                href="/feed"
                className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                See all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Article list */}
            {latest.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card py-20 text-center">
                <PenLine className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-muted-foreground">No articles yet.</p>
                <Link
                  href="/editor/new"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
                >
                  Be the first to write one <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
                {latest.map((post) => (
                  <FeedCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
            <div className="sticky top-20 space-y-6">

              {/* Trending */}
              {trending.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">Trending</h2>
                  </div>
                  <ol className="space-y-4">
                    {trending.map((post, i) => (
                      <li key={post.id} className="flex gap-3 group">
                        <span className="text-2xl font-bold text-border font-serif select-none w-7 shrink-0 text-right leading-none pt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/profile/${post.author.id}`}
                            className="flex items-center gap-1.5 mb-1"
                          >
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={post.author.image || ""} />
                              <AvatarFallback className="text-[8px] bg-muted">
                                {getInitials(post.author.name || "U")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate hover:text-foreground transition-colors">
                              {post.author.name}
                            </span>
                          </Link>
                          <Link href={`/article/${post.slug}`}>
                            <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:opacity-70 transition-opacity">
                              {post.title}
                            </p>
                          </Link>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />{post._count.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{post.readTime}m
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="mb-4 text-sm font-semibold text-foreground">Explore topics</h2>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link key={tag.id} href={`/tag/${tag.slug}`}>
                        <Badge
                          variant="outline"
                          className="cursor-pointer rounded-lg text-xs font-normal text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                        >
                          {tag.name}
                          <span className="ml-1.5 text-[10px] opacity-50">{tag._count.posts}</span>
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Write CTA */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="mb-1 text-sm font-semibold text-foreground">Start writing</h2>
                <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
                  Share your ideas with thousands of readers.
                </p>
                <Link
                  href="/editor/new"
                  className="flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  <PenLine className="h-4 w-4" />
                  Write a story
                </Link>
              </div>

              {/* Footer */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                {["Help", "About", "Privacy", "Terms"].map((l) => (
                  <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
                ))}
                <span className="w-full text-[10px] opacity-50">© 2025 Blogosphere</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ── Feed card component ── */
function FeedCard({ post }: { post: PostWithAuthor }) {
  const excerpt = post.excerpt || getExcerpt(post.content, 160);

  return (
    <article className="group px-5 py-5 transition-colors hover:bg-muted/30">
      {/* Author row */}
      <div className="mb-2.5 flex items-center gap-2">
        <Link href={`/profile/${post.author.id}`} className="flex items-center gap-1.5 hover:opacity-80">
          <Avatar className="h-6 w-6">
            {post.author.image && <AvatarImage src={post.author.image} alt={post.author.name || ""} />}
            <AvatarFallback className="text-[9px] bg-muted text-muted-foreground font-medium">
              {getInitials(post.author.name || "U")}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-foreground">{post.author.name}</span>
        </Link>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
      </div>

      {/* Content row */}
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/article/${post.slug}`}>
            <h2 className="mb-1.5 text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity">
              {post.title}
            </h2>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{excerpt}</p>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.tags.slice(0, 2).map(({ tag }) => (
                <Link key={tag.id} href={`/tag/${tag.slug}`}>
                  <Badge variant="secondary" className="rounded-md text-xs font-normal cursor-pointer hover:bg-muted transition-colors">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />{post.readTime}m
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Heart className="h-3.5 w-3.5" />
                {post._count.likes > 0 && post._count.likes}
              </button>
              <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <MessageCircle className="h-3.5 w-3.5" />
                {post._count.comments > 0 && post._count.comments}
              </button>
              <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Bookmark className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        {post.coverImage && (
          <Link href={`/article/${post.slug}`} className="shrink-0">
            <div className="h-20 w-28 sm:h-24 sm:w-32 overflow-hidden rounded-lg">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}
