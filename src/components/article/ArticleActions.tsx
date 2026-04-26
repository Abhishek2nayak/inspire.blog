"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Bookmark, Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface ArticleActionsProps {
  postId: string;
  initialLikes: number;
  initialBookmarked: boolean;
  initialLiked: boolean;
  commentCount?: number;
}

export default function ArticleActions({
  postId,
  initialLikes,
  initialBookmarked,
  initialLiked,
  commentCount = 0,
}: ArticleActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setLikeAnimation(true);
    setTimeout(() => setLikeAnimation(false), 500);

    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
    } catch {
      setLiked(!newLiked);
      setLikes((prev) => (newLiked ? Math.max(0, prev - 1) : prev + 1));
      toast.error("Failed to update like");
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);

    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast(newBookmarked ? "Added to bookmarks" : "Removed from bookmarks");
    } catch {
      setBookmarked(!newBookmarked);
      toast.error("Failed to update bookmark");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const scrollToComments = () => {
    const commentsEl = document.getElementById("comments");
    if (commentsEl) {
      commentsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      {/* Desktop: vertical bar on left side */}
      <div className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-5 bg-background/80 backdrop-blur-sm border border-border rounded-full px-3 py-4 shadow-lg">
        {/* Like */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleLike}
              className="flex flex-col items-center gap-1 group"
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  liked
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-muted-foreground group-hover:text-red-500",
                  likeAnimation && "scale-150"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  liked ? "text-red-500" : "text-muted-foreground"
                )}
              >
                {likes}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {liked ? "Unlike" : "Like"}
          </TooltipContent>
        </Tooltip>

        {/* Bookmark */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleBookmark}
              className="group"
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <Bookmark
                className={cn(
                  "h-5 w-5 transition-all duration-150",
                  bookmarked
                    ? "fill-foreground text-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {bookmarked ? "Remove bookmark" : "Bookmark"}
          </TooltipContent>
        </Tooltip>

        {/* Comments */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={scrollToComments}
              className="flex flex-col items-center gap-1 group"
              aria-label="Comments"
            >
              <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              {commentCount > 0 && (
                <span className="text-xs font-medium text-muted-foreground">
                  {commentCount}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Comments</TooltipContent>
        </Tooltip>

        {/* Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleShare}
              className="group"
              aria-label="Share"
            >
              <Share2
                className={cn(
                  "h-5 w-5 transition-colors",
                  copied
                    ? "text-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {copied ? "Copied!" : "Copy link"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Mobile: horizontal bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/90 backdrop-blur-sm border-t border-border px-6 py-3 flex items-center justify-around">
        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          className="flex items-center gap-2"
          aria-label={liked ? "Unlike" : "Like"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all duration-300",
              liked ? "fill-red-500 text-red-500" : "text-muted-foreground",
              likeAnimation && "scale-150"
            )}
          />
          <span
            className={cn(
              "text-sm font-medium",
              liked ? "text-red-500" : "text-muted-foreground"
            )}
          >
            {likes}
          </span>
        </button>

        {/* Bookmark */}
        <button
          type="button"
          onClick={handleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <Bookmark
            className={cn(
              "h-5 w-5 transition-all duration-150",
              bookmarked ? "fill-foreground text-foreground" : "text-muted-foreground"
            )}
          />
        </button>

        {/* Comments */}
        <button
          type="button"
          onClick={scrollToComments}
          className="flex items-center gap-2"
          aria-label="Comments"
        >
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          {commentCount > 0 && (
            <span className="text-sm font-medium text-muted-foreground">
              {commentCount}
            </span>
          )}
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share"
        >
          <Share2
            className={cn(
              "h-5 w-5 transition-colors",
              copied ? "text-foreground" : "text-muted-foreground"
            )}
          />
        </button>
      </div>
    </TooltipProvider>
  );
}
