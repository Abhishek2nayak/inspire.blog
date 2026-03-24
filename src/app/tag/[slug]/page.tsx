import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Hash } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { PostWithAuthor } from "@/types";
import ArticleCard from "@/components/article/ArticleCard";
import { Badge } from "@/components/ui/badge";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

async function getTagWithPosts(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        where: {
          post: { published: true },
        },
        orderBy: { post: { publishedAt: "desc" } },
        include: {
          post: {
            include: {
              author: {
                select: { id: true, name: true, image: true, bio: true },
              },
              tags: {
                include: { tag: true },
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                  bookmarks: true,
                  reactions: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return tag;
}

async function getRelatedTags(currentSlug: string) {
  const tags = await prisma.tag.findMany({
    where: { slug: { not: currentSlug } },
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
    take: 10,
  });
  return tags;
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return { title: "Tag not found" };
  return {
    title: `#${tag.name} — Inspire.blog`,
    description: `Articles tagged with ${tag.name}`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await getTagWithPosts(slug);

  if (!tag) notFound();

  const [relatedTags] = await Promise.all([getRelatedTags(slug)]);

  const posts = tag.posts.map(
    ({ post }) => post as unknown as PostWithAuthor
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div>
          {/* Tag header */}
          <div className="mb-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <Hash className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {tag.name}
                </h1>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {posts.length}{" "}
                  {posts.length === 1 ? "article" : "articles"}
                </p>
              </div>
            </div>
          </div>

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/30 py-16 text-center">
              <div className="mb-3 rounded-full bg-muted p-4">
                <Hash className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="mb-1 text-lg font-semibold text-foreground">
                No articles yet
              </h2>
              <p className="text-sm text-muted-foreground">
                Be the first to write about {tag.name}!
              </p>
              <Link
                href="/editor/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Write an article
              </Link>
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Related tags */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">
                Other Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatedTags.map((relTag) => (
                  <Link
                    key={relTag.id}
                    href={`/tag/${relTag.slug}`}
                    className="group"
                  >
                    <Badge
                      variant="secondary"
                      className="cursor-pointer transition-colors group-hover:bg-primary/10 group-hover:text-primary"
                    >
                      #{relTag.name}
                      {relTag._count.posts > 0 && (
                        <span className="ml-1 text-muted-foreground">
                          {relTag._count.posts}
                        </span>
                      )}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Share this topic
              </h2>
              <p className="mb-3 text-xs text-muted-foreground">
                Enjoying articles about {tag.name}? Share this page.
              </p>
              <Link
                href={`/editor/new?tag=${tag.slug}`}
                className="block w-full rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Write about {tag.name}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
