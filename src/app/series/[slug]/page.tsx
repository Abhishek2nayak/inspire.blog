import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getInitials, formatDate } from "@/lib/date-utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ post?: string }>;
}

async function getSeries(slug: string) {
  return prisma.series.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, image: true, bio: true } },
      posts: {
        where: { published: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true, slug: true, excerpt: true, readTime: true, publishedAt: true },
      },
    },
  });
}

export async function generateMetadata({ params }: SeriesPageProps) {
  const { slug } = await params;
  const series = await prisma.series.findUnique({ where: { slug } });
  if (!series) return { title: "Series not found" };
  return {
    title: `${series.title} — Inspire.blog`,
    description: series.description ?? "A series on Inspire.blog",
  };
}

export default async function SeriesSlugPage({ params, searchParams }: SeriesPageProps) {
  const { slug } = await params;
  const { post: currentPostSlug } = await searchParams;

  const series = await getSeries(slug);
  if (!series) notFound();

  const posts = series.posts;
  const totalReadTime = posts.reduce((acc, p) => acc + (p.readTime ?? 0), 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-10 rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
          <BookOpen className="h-6 w-6 text-foreground" />
        </div>

        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">Series</Badge>
          <span className="text-xs text-muted-foreground">
            {posts.length} part{posts.length !== 1 ? "s" : ""}
          </span>
          {totalReadTime > 0 && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {totalReadTime} min total
              </span>
            </>
          )}
        </div>

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-serif">
          {series.title}
        </h1>

        {series.description && (
          <p className="mb-5 text-muted-foreground leading-relaxed">{series.description}</p>
        )}

        <Link
          href={`/profile/${series.authorId}`}
          className="inline-flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted"
        >
          <Avatar className="h-8 w-8">
            {series.author.image && (
              <AvatarImage src={series.author.image} alt={series.author.name ?? ""} />
            )}
            <AvatarFallback className="bg-muted text-xs font-medium">
              {getInitials(series.author.name ?? "A")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{series.author.name}</p>
            <p className="text-xs text-muted-foreground">Author</p>
          </div>
        </Link>
      </div>

      {/* Posts list */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Posts in this series
        </h2>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 py-14 text-center">
            <p className="text-muted-foreground">No published posts in this series yet.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {posts.map((post, index) => {
              const isCurrent = currentPostSlug === post.slug;
              return (
                <li key={post.id}>
                  <Link
                    href={`/article/${post.slug}?series=${series.slug}`}
                    className={`group flex items-start gap-4 rounded-xl border p-4 transition-all hover:shadow-sm ${
                      isCurrent
                        ? "border-foreground/30 bg-muted"
                        : "border-border bg-card hover:border-foreground/20"
                    }`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">
                          {post.title}
                          {isCurrent && (
                            <Badge variant="outline" className="ml-2 text-xs align-middle">Current</Badge>
                          )}
                        </h3>
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                      {post.excerpt && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        {post.readTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{post.readTime} min read
                          </span>
                        )}
                        {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {posts.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Link
            href={`/article/${posts[0].slug}?series=${series.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            Start Reading <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
