export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { PostWithAuthor } from "@/types";
import { formatDate, getInitials, getExcerpt } from "@/lib/date-utils";
import {
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  ArrowRight,
  Bookmark,
  PenLine,
} from "lucide-react";
import NewsletterSignup from "@/components/shared/NewsletterSignup";
import SponsorCard from "@/components/shared/SponsorCard";

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
    take: 20,
  });
}

export default async function HomePage() {
  const [latest, trending, tags] = await Promise.all([
    getLatestPosts(),
    getTrendingPosts(),
    getTags(),
  ]);

  const [featured, ...rest] = latest;

  return (
    <main className="min-h-screen bg-background">
      {/* ── Masthead — green theme with illustrations ── */}
      <section
        className="relative overflow-hidden border-b border-[#a8d5c2]"
        style={{ backgroundColor: "#b8deca" }}
      >
        {/* Background decorative circles */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/15" />
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full bg-white/10" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            {/* Left — text */}
            <div className="max-w-lg">
              {/* Badge */}
              {/* <div className="inline-flex items-center gap-2 bg-white/40 border border-white/60 rounded-full px-3 py-1 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2d7d59] animate-pulse" />
                <span className="text-xs font-semibold text-[#1a2e28] tracking-wide">
                  Live community
                </span>
              </div> */}

              <h1
                className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4"
                style={{
                  color: "#1a2e28",
                  fontFamily:
                    "var(--font-playfair, 'Playfair Display', Georgia, serif)",
                }}
              >
                Stay curious<span style={{ color: "#2d7d59" }}>.</span>
              </h1>
              <p
                className="text-base leading-relaxed mb-8 max-w-sm"
                style={{ color: "#3d6658" }}
              >
                Discover stories, ideas, and expertise from writers on every
                topic that matters to you.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: "#1a2e28" }}
                >
                  Start reading
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/editor/new"
                  className="inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all hover:bg-white/30"
                  style={{ borderColor: "#1a2e28", color: "#1a2e28" }}
                >
                  <PenLine className="h-4 w-4" />
                  Start writing
                </Link>
              </div>

              {/* Stats */}
              {/* <div className="flex items-center gap-6 mt-8">
                {[
                  { value: "50K+", label: "Writers" },
                  { value: "200K+", label: "Articles" },
                  { value: "1M+", label: "Readers" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-xl font-bold" style={{ color: "#1a2e28" }}>{value}</p>
                    <p className="text-xs" style={{ color: "#4a7265" }}>{label}</p>
                  </div>
                ))}
              </div> */}
            </div>

            {/* Right — SVG illustration */}
            <div className="hidden sm:block relative w-72 h-64 shrink-0">
              <svg viewBox="0 0 280 240" className="w-full h-full" fill="none">
                {/* Desk */}
                <rect
                  x="20"
                  y="170"
                  width="240"
                  height="10"
                  rx="5"
                  fill="#2d7d59"
                  opacity="0.3"
                />
                {/* Chair legs */}
                <rect
                  x="90"
                  y="180"
                  width="8"
                  height="28"
                  rx="4"
                  fill="#2d7d59"
                  opacity="0.25"
                />
                <rect
                  x="182"
                  y="180"
                  width="8"
                  height="28"
                  rx="4"
                  fill="#2d7d59"
                  opacity="0.25"
                />

                {/* Person body */}
                <ellipse
                  cx="140"
                  cy="145"
                  rx="28"
                  ry="34"
                  fill="#2d7d59"
                  opacity="0.5"
                />
                {/* Head */}
                <circle
                  cx="140"
                  cy="96"
                  r="24"
                  fill="#a8d5c2"
                  stroke="#2d7d59"
                  strokeWidth="2.5"
                  opacity="0.95"
                />
                {/* Hair */}
                <path
                  d="M116 90 Q140 72 164 90"
                  stroke="#1a2e28"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Eyes */}
                <circle cx="132" cy="96" r="2.5" fill="#1a2e28" opacity="0.6" />
                <circle cx="148" cy="96" r="2.5" fill="#1a2e28" opacity="0.6" />
                {/* Smile */}
                <path
                  d="M133 106 Q140 112 147 106"
                  stroke="#1a2e28"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.5"
                />
                {/* Arms */}
                <path
                  d="M114 145 Q88 157 80 164"
                  stroke="#2d7d59"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.5"
                />
                <path
                  d="M166 145 Q192 157 200 164"
                  stroke="#2d7d59"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.5"
                />

                {/* Laptop */}
                <rect
                  x="78"
                  y="156"
                  width="124"
                  height="16"
                  rx="4"
                  fill="white"
                  opacity="0.75"
                />
                <rect
                  x="83"
                  y="161"
                  width="55"
                  height="3"
                  rx="1.5"
                  fill="#2d7d59"
                  opacity="0.5"
                />
                <rect
                  x="83"
                  y="167"
                  width="38"
                  height="3"
                  rx="1.5"
                  fill="#2d7d59"
                  opacity="0.35"
                />

                {/* Floating document — top left */}
                <rect
                  x="14"
                  y="34"
                  width="42"
                  height="54"
                  rx="6"
                  fill="white"
                  opacity="0.7"
                  transform="rotate(-14 14 34)"
                />
                <rect
                  x="20"
                  y="44"
                  width="26"
                  height="3"
                  rx="1.5"
                  fill="#2d7d59"
                  opacity="0.5"
                  transform="rotate(-14 14 34)"
                />
                <rect
                  x="20"
                  y="51"
                  width="20"
                  height="3"
                  rx="1.5"
                  fill="#2d7d59"
                  opacity="0.4"
                  transform="rotate(-14 14 34)"
                />
                <rect
                  x="20"
                  y="58"
                  width="23"
                  height="3"
                  rx="1.5"
                  fill="#2d7d59"
                  opacity="0.4"
                  transform="rotate(-14 14 34)"
                />
                <rect
                  x="20"
                  y="65"
                  width="15"
                  height="3"
                  rx="1.5"
                  fill="#2d7d59"
                  opacity="0.3"
                  transform="rotate(-14 14 34)"
                />

                {/* Clock — top right */}
                <circle cx="236" cy="46" r="22" fill="white" opacity="0.7" />
                <circle cx="236" cy="46" r="16" fill="white" opacity="0.4" />
                <path
                  d="M236 33 L236 46 L244 46"
                  stroke="#2d7d59"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                <circle cx="236" cy="46" r="2.5" fill="#2d7d59" opacity="0.6" />

                {/* Plant — bottom right */}
                <rect
                  x="228"
                  y="156"
                  width="9"
                  height="18"
                  rx="4.5"
                  fill="#2d7d59"
                  opacity="0.4"
                />
                <ellipse
                  cx="232"
                  cy="147"
                  rx="14"
                  ry="11"
                  fill="#2d7d59"
                  opacity="0.35"
                />
                <ellipse
                  cx="221"
                  cy="153"
                  rx="10"
                  ry="7"
                  fill="#2d7d59"
                  opacity="0.28"
                />
                <ellipse
                  cx="243"
                  cy="153"
                  rx="10"
                  ry="7"
                  fill="#2d7d59"
                  opacity="0.28"
                />

                {/* Pencil — left */}
                <rect
                  x="36"
                  y="118"
                  width="8"
                  height="32"
                  rx="4"
                  fill="#f5c842"
                  opacity="0.9"
                  transform="rotate(24 36 118)"
                />
                <path
                  d="M34 146 L42 146 L38 156 Z"
                  fill="#e05050"
                  opacity="0.8"
                  transform="rotate(24 36 118)"
                />

                {/* Sparkle top-right */}
                <path
                  d="M258 84 L260 90 L266 92 L260 94 L258 100 L256 94 L250 92 L256 90 Z"
                  fill="#2d7d59"
                  opacity="0.45"
                />
                {/* Small sparkle left */}
                <path
                  d="M60 140 L61.5 144 L66 145.5 L61.5 147 L60 151 L58.5 147 L54 145.5 L58.5 144 Z"
                  fill="#2d7d59"
                  opacity="0.35"
                />
                {/* Dots decoration */}
                <circle
                  cx="200"
                  cy="130"
                  r="3.5"
                  fill="#2d7d59"
                  opacity="0.25"
                />
                <circle
                  cx="212"
                  cy="122"
                  r="2.5"
                  fill="#2d7d59"
                  opacity="0.2"
                />
                <circle cx="224" cy="116" r="2" fill="#2d7d59" opacity="0.15" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex gap-8 xl:gap-14">
          {/* ── Main feed ── */}
          <div className="flex-1 min-w-0">
            {latest.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card py-20 text-center">
                <PenLine className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-muted-foreground">No articles yet.</p>
                <Link
                  href="/editor/new"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
                >
                  Be the first to write one{" "}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <>
                {/* ── Featured post ── */}
                {featured && <FeaturedCard post={featured} />}

                {/* ── Divider ── */}
                {rest.length > 0 && (
                  <div className="my-8 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Latest
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                {/* ── Article list ── */}
                <div className="divide-y divide-border">
                  {rest.map((post) => (
                    <FeedCard key={post.id} post={post} />
                  ))}
                </div>

                {/* See all */}
                <div className="mt-8 text-center">
                  <Link
                    href="/feed"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    See all stories <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
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
                    <h2 className="text-sm font-semibold text-foreground">
                      Trending on Inspire.blog
                    </h2>
                  </div>
                  <ol className="space-y-5">
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
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={post.author.image || ""} />
                              <AvatarFallback className="text-[8px] bg-muted">
                                {getInitials(post.author.name || "U")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-foreground truncate">
                              {post.author.name}
                            </span>
                          </Link>
                          <Link href={`/article/${post.slug}`}>
                            <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:opacity-60 transition-opacity">
                              {post.title}
                            </p>
                          </Link>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post._count.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime} min
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Sponsor slot */}
              <SponsorCard />

              {/* Topics */}
              {tags.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="mb-3 text-sm font-semibold text-foreground">
                    Recommended topics
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link key={tag.id} href={`/tag/${tag.slug}`}>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer rounded-full text-xs font-medium transition-colors hover:bg-foreground hover:text-background"
                        >
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/feed"
                    className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    See more topics <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Footer links */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                {["Help", "About", "Privacy", "Terms"].map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {l}
                  </a>
                ))}
                <span className="w-full text-[10px] opacity-50">
                  © {new Date().getFullYear()} Inspire.blog
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Newsletter ── */}
      <div className="mt-12">
        <NewsletterSignup
          variant="hero"
          title="Get the best articles in your inbox"
          description="Join thousands of developers and creators. No spam, unsubscribe anytime."
        />
      </div>
    </main>
  );
}

/* ── Featured (hero) card ── */
function FeaturedCard({ post }: { post: PostWithAuthor }) {
  const excerpt = post.excerpt || getExcerpt(post.content, 200);
  return (
    <article className="group mb-2">
      <Link href={`/article/${post.slug}`}>
        {post.coverImage && (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden rounded-2xl mb-5">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              priority
            />
          </div>
        )}
      </Link>

      {/* Author */}
      <div className="mb-2 flex items-center gap-2">
        <Link
          href={`/profile/${post.author.id}`}
          className="flex items-center gap-2 hover:opacity-80"
        >
          <Avatar className="h-7 w-7">
            {post.author.image && (
              <AvatarImage
                src={post.author.image}
                alt={post.author.name || ""}
              />
            )}
            <AvatarFallback className="text-[10px] bg-muted font-medium">
              {getInitials(post.author.name || "U")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">
            {post.author.name}
          </span>
        </Link>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-sm text-muted-foreground">
          {formatDate(post.createdAt)}
        </span>
      </div>

      {/* Title */}
      <Link href={`/article/${post.slug}`}>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug mb-2 group-hover:opacity-70 transition-opacity line-clamp-2">
          {post.title}
        </h2>
      </Link>

      {/* Excerpt */}
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3 mb-3">
        {excerpt}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {post.tags.slice(0, 2).map(({ tag }) => (
            <Link key={tag.id} href={`/tag/${tag.slug}`}>
              <Badge
                variant="secondary"
                className="rounded-full text-xs font-medium cursor-pointer hover:bg-foreground hover:text-background transition-colors"
              >
                {tag.name}
              </Badge>
            </Link>
          ))}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {post.readTime} min read
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <span className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
            <Heart className="h-3.5 w-3.5" />
            {post._count.likes > 0 && post._count.likes}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            {post._count.comments > 0 && post._count.comments}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ── Regular feed card ── */
function FeedCard({ post }: { post: PostWithAuthor }) {
  const excerpt = post.excerpt || getExcerpt(post.content, 140);

  return (
    <article className="group py-5 transition-colors hover:bg-muted/20 -mx-3 px-3 rounded-xl">
      {/* Author row */}
      <div className="mb-2 flex items-center gap-2">
        <Link
          href={`/profile/${post.author.id}`}
          className="flex items-center gap-1.5 hover:opacity-80"
        >
          <Avatar className="h-5 w-5">
            {post.author.image && (
              <AvatarImage
                src={post.author.image}
                alt={post.author.name || ""}
              />
            )}
            <AvatarFallback className="text-[9px] bg-muted text-muted-foreground font-medium">
              {getInitials(post.author.name || "U")}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-foreground">
            {post.author.name}
          </span>
        </Link>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-xs text-muted-foreground">
          {formatDate(post.createdAt)}
        </span>
      </div>

      {/* Content row */}
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/article/${post.slug}`}>
            <h2 className="mb-1 text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity">
              {post.title}
            </h2>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 hidden sm:block">
            {excerpt}
          </p>

          {/* Footer */}
          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {post.tags.slice(0, 1).map(({ tag }) => (
                <Link key={tag.id} href={`/tag/${tag.slug}`}>
                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs font-medium cursor-pointer hover:bg-foreground hover:text-background transition-colors"
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {post.readTime} min
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                aria-label="Like"
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Heart className="h-3.5 w-3.5" />
                {post._count.likes > 0 && post._count.likes}
              </button>
              <button
                aria-label="Comments"
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {post._count.comments > 0 && post._count.comments}
              </button>
              <button
                aria-label="Bookmark"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Bookmark className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        {post.coverImage && (
          <Link href={`/article/${post.slug}`} className="shrink-0">
            <div className="relative h-16 w-24 sm:h-20 sm:w-28 overflow-hidden rounded-lg">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 96px, 112px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}
