import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ArticleContent from "@/components/article/ArticleContent";
import ArticleActions from "@/components/article/ArticleActions";
import CommentSection from "@/components/article/CommentSection";
import ReadingProgressBar from "@/components/article/ReadingProgressBar";
import TableOfContents from "@/components/article/TableOfContents";
import ReactionBar from "@/components/article/ReactionBar";
import FollowButton from "@/components/shared/FollowButton";
import { getInitials } from "@/lib/utils";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          _count: {
            select: { posts: true, followers: true },
          },
        },
      },
      tags: {
        include: { tag: true },
      },
      comments: {
        where: { parentId: null },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
          replies: {
            include: {
              author: {
                select: { id: true, name: true, image: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      likes: true,
      bookmarks: true,
      reactions: {
        select: { emoji: true, userId: true },
      },
      _count: {
        select: { likes: true, comments: true, bookmarks: true },
      },
    },
  });

  return post;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.excerpt || undefined,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author.name || ""],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Increment views (fire and forget)
  prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  }).catch(() => {});

  const currentUser = await getCurrentUser();

  const isLiked = currentUser
    ? post.likes.some((like) => like.userId === currentUser.id)
    : false;

  const isBookmarked = currentUser
    ? post.bookmarks.some((bm) => bm.userId === currentUser.id)
    : false;

  // Build reaction groups
  const reactionMap = new Map<string, { count: number; reacted: boolean }>();
  for (const reaction of post.reactions) {
    const existing = reactionMap.get(reaction.emoji) || {
      count: 0,
      reacted: false,
    };
    reactionMap.set(reaction.emoji, {
      count: existing.count + 1,
      reacted: existing.reacted || reaction.userId === currentUser?.id,
    });
  }
  const reactionGroups = Array.from(reactionMap.entries()).map(
    ([emoji, data]) => ({ emoji, ...data })
  );

  // Check if current user follows the author
  let isFollowing = false;
  if (currentUser && currentUser.id !== post.author.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: post.author.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const authorInitials = getInitials(post.author.name || "U");

  return (
    <>
      <ReadingProgressBar />

      <main className="min-h-screen bg-background">
        {/* Hero / Cover image */}
        {post.coverImage && (
          <div className="relative w-full max-h-[480px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent z-10" />
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover rounded-none"
              style={{ maxHeight: "480px", width: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex gap-12">
            {/* Main content column */}
            <div className="flex-1 min-w-0 max-w-3xl mx-auto xl:mx-0">
              <article>
                {/* Tags at top */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(({ tag }) => (
                      <Link key={tag.id} href={`/tag/${tag.slug}`}>
                        <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground leading-tight tracking-tight mb-4">
                  {post.title}
                </h1>

                {/* Subtitle / Excerpt */}
                {post.excerpt && (
                  <p className="text-xl text-muted-foreground italic leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                )}

                {/* Author card */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                  <div className="flex items-center gap-4">
                    <Link href={`/profile/${post.author.id}`} className="shrink-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={post.author.image || undefined}
                          alt={post.author.name || ""}
                        />
                        <AvatarFallback>{authorInitials}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link
                          href={`/profile/${post.author.id}`}
                          className="font-semibold text-foreground hover:underline"
                        >
                          {post.author.name}
                        </Link>
                        <FollowButton
                          userId={post.author.id}
                          initialFollowing={isFollowing}
                        />
                      </div>
                      {post.author.bio && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">
                          {post.author.bio}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{post.readTime} min read</span>
                        <span>&middot;</span>
                        <span>{formatDate(post.createdAt)}</span>
                        {post._count.comments > 0 && (
                          <>
                            <span>&middot;</span>
                            <span>{post._count.comments} comments</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Article content */}
                <ArticleContent content={post.content} />

                <Separator className="my-10" />

                {/* Reactions */}
                <ReactionBar
                  postId={post.id}
                  initialReactions={reactionGroups}
                />

                <Separator className="my-6" />

                {/* Actions (mobile) */}
                <ArticleActions
                  postId={post.id}
                  initialLikes={post._count.likes}
                  initialBookmarked={isBookmarked}
                  initialLiked={isLiked}
                  commentCount={post._count.comments}
                />

                <Separator className="my-8" />

                {/* Author bio card */}
                <div className="bg-muted/50 rounded-2xl p-6 flex gap-5 items-start">
                  <Link href={`/profile/${post.author.id}`} className="shrink-0">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={post.author.image || undefined}
                        alt={post.author.name || ""}
                      />
                      <AvatarFallback className="text-lg">
                        {authorInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <Link
                          href={`/profile/${post.author.id}`}
                          className="font-bold text-foreground hover:underline text-lg"
                        >
                          {post.author.name}
                        </Link>
                        {"_count" in post.author && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {(post.author as typeof post.author & { _count: { posts: number } })._count.posts} posts
                          </p>
                        )}
                      </div>
                      <FollowButton
                        userId={post.author.id}
                        initialFollowing={isFollowing}
                      />
                    </div>
                    {post.author.bio && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {post.author.bio}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Comments */}
                <CommentSection
                  postId={post.id}
                  initialComments={post.comments}
                />
              </article>
            </div>

            {/* Sidebar: Table of contents */}
            <aside className="hidden xl:block w-56 shrink-0">
              <TableOfContents content={post.content} />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
