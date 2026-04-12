"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn, formatDate, getExcerpt, getInitials } from "@/lib/utils";
import type { PostWithAuthor } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Heart, Bookmark, MessageCircle, Clock } from "lucide-react";

interface ArticleCardProps {
  post: PostWithAuthor;
  className?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ post, className }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const excerpt = post.excerpt || getExcerpt(post.content, 160);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
    try {
      await fetch(`/api/posts/${post.id}/bookmark`, { method: "POST" });
    } catch {
      setIsBookmarked((prev) => !prev);
    }
  };

  return (
    <article
      className={cn(
        "py-6 border-b border-border group transition-all hover:bg-muted/20 -mx-1 px-1 rounded-xl",
        className
      )}
    >
      <div className="flex gap-4 sm:gap-6">
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Author row */}
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${post.author.id}`}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-5 w-5">
                {post.author.image && (
                  <AvatarImage src={post.author.image} alt={post.author.name || ""} />
                )}
                <AvatarFallback className="text-[9px] bg-muted text-muted-foreground font-medium">
                  {getInitials(post.author.name || "U")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-foreground">{post.author.name}</span>
            </Link>
            <span className="text-muted-foreground/40 hidden sm:inline">·</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {formatDate(post.createdAt)}
            </span>
          </div>

          {/* Title */}
          <Link href={`/article/${post.slug}`} className="block">
            <h2 className="font-bold font-sans text-foreground text-base sm:text-lg leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">
              {post.title}
            </h2>
          </Link>

          {/* Excerpt — hidden on very small screens */}
          <Link href={`/article/${post.slug}`} className="hidden sm:block">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {excerpt}
            </p>
          </Link>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {post.readTime} min read
              </div>
              {post.tags.slice(0, 2).map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs rounded-full cursor-pointer hover:bg-foreground hover:text-background transition-colors"
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5">
              <button
                aria-label="Like"
                className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Heart className="h-3.5 w-3.5" />
                {post._count.likes > 0 && <span>{post._count.likes}</span>}
              </button>

              <button
                aria-label="Comments"
                className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {post._count.comments > 0 && <span>{post._count.comments}</span>}
              </button>

              <button
                onClick={handleBookmark}
                className={cn(
                  "p-1.5 rounded-lg transition-all cursor-pointer",
                  isBookmarked
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")} />
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        {post.coverImage && (
          <Link
            href={`/article/${post.slug}`}
            className="hidden sm:block flex-shrink-0"
          >
            <div className="relative w-28 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 112px, 128px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
};

export default ArticleCard;
