import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { getInitials, getExcerpt, formatDate } from "@/lib/date-utils";

interface RelatedPostsProps {
  postId: string;
  tagIds: string[];
  authorId: string;
}

export default async function RelatedPosts({ postId, tagIds, authorId }: RelatedPostsProps) {
  // Fetch posts with matching tags or same author, excluding current post
  const related = await prisma.post.findMany({
    where: {
      published: true,
      id: { not: postId },
      OR: [
        { tags: { some: { tagId: { in: tagIds } } } },
        { authorId },
      ],
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { views: "desc" },
    take: 3,
  });

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Related articles</h2>
        <Link
          href="/feed"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          See all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => {
          const excerpt = post.excerpt || getExcerpt(post.content, 100);
          return (
            <article
              key={post.id}
              className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md"
            >
              {post.coverImage && (
                <Link href={`/article/${post.slug}`}>
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
              )}
              <div className="flex flex-1 flex-col p-4">
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map(({ tag }) => (
                      <Link key={tag.id} href={`/tag/${tag.slug}`}>
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
                {/* Title */}
                <Link href={`/article/${post.slug}`} className="flex-1">
                  <h3 className="mb-2 text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {excerpt}
                  </p>
                </Link>
                {/* Author + meta */}
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  <Link href={`/profile/${post.author.id}`}>
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={post.author.image || ""} />
                      <AvatarFallback className="text-[8px]">
                        {getInitials(post.author.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <span className="flex-1 text-[11px] text-muted-foreground truncate">
                    {post.author.name}
                  </span>
                  <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {post.readTime}m
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
