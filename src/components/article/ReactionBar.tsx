"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { ReactionGroup } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const EMOJIS = ["👍", "❤️", "🔥", "🎉", "🤔", "👀"] as const;

interface ReactionBarProps {
  postId: string;
  initialReactions?: ReactionGroup[];
}

export default function ReactionBar({
  postId,
  initialReactions = [],
}: ReactionBarProps) {
  const { data: session } = useSession();
  const [reactions, setReactions] = useState<ReactionGroup[]>(() => {
    // Ensure all emojis are represented
    return EMOJIS.map((emoji) => {
      const existing = initialReactions.find((r) => r.emoji === emoji);
      return existing ?? { emoji, count: 0, reacted: false };
    });
  });
  const [animating, setAnimating] = useState<string | null>(null);

  const handleReact = async (emoji: string) => {
    if (!session) return;

    // Optimistic update
    setAnimating(emoji);
    setTimeout(() => setAnimating(null), 400);

    setReactions((prev) =>
      prev.map((r) => {
        if (r.emoji !== emoji) return r;
        const wasReacted = r.reacted;
        return {
          ...r,
          reacted: !wasReacted,
          count: wasReacted ? Math.max(0, r.count - 1) : r.count + 1,
        };
      })
    );

    try {
      await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {
      // Revert on error
      setReactions((prev) =>
        prev.map((r) => {
          if (r.emoji !== emoji) return r;
          const wasOptimistic = r.reacted;
          return {
            ...r,
            reacted: !wasOptimistic,
            count: wasOptimistic ? Math.max(0, r.count - 1) : r.count + 1,
          };
        })
      );
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-2 py-4">
        {reactions.map((r) => (
          <Tooltip key={r.emoji}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleReact(r.emoji)}
                disabled={!session}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all duration-150 select-none",
                  r.reacted
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border bg-background hover:bg-muted text-foreground",
                  animating === r.emoji && "scale-125",
                  !session && "cursor-not-allowed opacity-80"
                )}
                aria-label={`React with ${r.emoji}`}
              >
                <span
                  className={cn(
                    "text-base transition-transform",
                    animating === r.emoji && "scale-125"
                  )}
                >
                  {r.emoji}
                </span>
                {r.count > 0 && (
                  <span className="text-xs font-medium">{r.count}</span>
                )}
              </button>
            </TooltipTrigger>
            {!session && (
              <TooltipContent>Sign in to react</TooltipContent>
            )}
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
