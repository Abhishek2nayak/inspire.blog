"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { copyText } from "./copy-text";

interface CopyBlockProps {
  text: string;
  /** Prompt id — when present, a successful copy increments the copy counter. */
  promptId?: string;
  label?: string;
  className?: string;
  /** Smaller, denser rendering for variations and inline use. */
  compact?: boolean;
}

export default function CopyBlock({
  text,
  promptId,
  label = "Copy prompt",
  className,
  compact = false,
}: CopyBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleCopy() {
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
    toast({ title: "Copied", description: "Prompt copied to your clipboard." });

    // Fire-and-forget. keepalive lets it survive the user navigating away.
    if (promptId) {
      fetch(`/api/prompts/${promptId}/copy`, {
        method: "POST",
        keepalive: true,
      }).catch(() => {
        /* a dropped vanity metric must never surface as an error */
      });
    }
  }

  return (
    <div className={cn("overflow-hidden rounded-md border-2 border-ink bg-paper-cool", className)}>
      <pre
        className={cn(
          "overflow-x-auto whitespace-pre-wrap break-words font-mono text-foreground",
          compact ? "p-3 text-xs leading-relaxed" : "p-4 text-[13px] leading-relaxed sm:p-5"
        )}
      >
        {text}
      </pre>
      <div className="flex items-center justify-between gap-3 border-t-2 border-ink bg-paper-cool-2 px-3 py-2">
        <span className="text-[11px] font-medium text-muted-foreground">
          {text.length} characters
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border-2 border-ink px-3 py-1.5",
            "text-xs font-semibold text-ink transition-colors",
            copied ? "bg-chip-green text-chip-green-fg" : "bg-lime hover:bg-lime-deep"
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : label}
        </button>
      </div>
    </div>
  );
}
