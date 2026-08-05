"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useToggleBookmark, type BookmarkKind } from "@/hooks/use-bookmark";

type Kind = BookmarkKind;

/**
 * Polymorphic save toggle. Signed-out users are sent to /login with a return
 * path rather than having the click silently do nothing.
 */
export default function SaveButton({
  kind,
  id,
  initialSaved = false,
  className,
}: {
  kind: Kind;
  id: string;
  initialSaved?: boolean;
  className?: string;
}) {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [saved, setSaved] = useState(initialSaved);

  const toggleBookmark = useToggleBookmark();
  const busy = toggleBookmark.isPending;

  function toggle() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (busy) return; // a second click mid-flight would race the first

    const next = !saved;
    setSaved(next); // optimistic

    toggleBookmark.mutate(
      { kind, id },
      {
        // Trust the server's answer over the optimistic guess — they diverge
        // if the row was already toggled from another tab.
        onSuccess: (serverSaved) => setSaved(serverSaved),
        onError: (err) => {
          setSaved(!next); // roll back
          toast({
            title: "Couldn't save",
            description: err instanceof Error ? err.message : undefined,
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
        saved
          ? "border-ink bg-lime text-ink"
          : "border-border text-muted-foreground hover:border-ink hover:text-foreground",
        className
      )}
    >
      <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
