"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useToggleLike } from "@/hooks/use-like";

/** Polymorphic-free (prompts only, for now) like toggle — see SaveButton for
 * the same pattern applied to bookmarks. Signed-out clicks redirect to
 * /login with a return path rather than doing nothing. */
export default function LikeButton({
  promptId,
  initialLiked = false,
  initialCount = 0,
  className,
}: {
  promptId: string;
  initialLiked?: boolean;
  initialCount?: number;
  className?: string;
}) {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const toggleLike = useToggleLike();
  const busy = toggleLike.isPending;

  function toggle() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (busy) return;

    const next = !liked;
    setLiked(next); // optimistic
    setCount((c) => c + (next ? 1 : -1));

    toggleLike.mutate(promptId, {
      onSuccess: ({ liked: serverLiked, likeCount }) => {
        setLiked(serverLiked);
        setCount(likeCount);
      },
      onError: (err) => {
        setLiked(!next);
        setCount((c) => c - (next ? 1 : -1));
        toast({
          title: "Couldn't like this",
          description: err instanceof Error ? err.message : undefined,
          variant: "destructive",
        });
      },
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
        liked
          ? "border-ink bg-lime text-ink"
          : "border-border text-muted-foreground hover:border-ink hover:text-foreground",
        className
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
      {formatNumber(count)}
    </button>
  );
}
