"use client";

import { useState } from "react";
import { Check, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { copyText } from "./copy-text";

/**
 * One button that copies the entire listing — body, negative prompt and
 * parameters already assembled — so nothing has to be stitched together by
 * hand. Sits above the individual copy blocks, which remain for anyone who
 * only wants one piece.
 */
export default function CopyEverything({
  text,
  promptId,
  includes,
  className,
}: {
  text: string;
  promptId?: string;
  /** Labels of what's bundled in, shown so the button's scope is obvious. */
  includes: string[];
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handle() {
    const ok = await copyText(text);
    if (!ok) {
      toast({
        title: "Couldn't copy automatically",
        description: "Select the prompt text and press Ctrl+C (or Cmd+C).",
        variant: "destructive",
      });
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "Full prompt is on your clipboard." });

    if (promptId) {
      fetch(`/api/prompts/${promptId}/copy`, { method: "POST", keepalive: true }).catch(() => {});
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-md border-2 border-ink bg-lime px-4 py-3",
        className
      )}
    >
      <div className="min-w-0">
        <p className="font-display text-sm font-bold text-ink">Copy the whole thing</p>
        <p className="mt-0.5 text-[11px] leading-snug text-ink/75">
          Includes {includes.join(" + ")} — ready to paste.
        </p>
      </div>
      <button
        type="button"
        onClick={handle}
        aria-live="polite"
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-md border-2 border-ink px-3.5 py-2",
          "text-xs font-semibold transition-colors",
          copied ? "bg-ink text-bone" : "bg-bone text-ink hover:bg-paper-warm"
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCheck className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy full prompt"}
      </button>
    </div>
  );
}
