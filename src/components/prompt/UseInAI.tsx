"use client";

import { ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { copyText } from "./copy-text";

/**
 * Deep-links that carry the prompt straight into the target chat box via its
 * (unofficial, undocumented) `?q=` query param. Neither vendor guarantees
 * this — it can stop working without notice — so every click ALSO copies the
 * prompt to the clipboard first as a safety net: if the param is ignored,
 * the user can just paste.
 */
const TARGETS = [
  { name: "ChatGPT", buildUrl: (q: string) => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
  {
    name: "Gemini",
    buildUrl: (q: string) => `https://gemini.google.com/app?q=${encodeURIComponent(q)}`,
  },
] as const;

export default function UseInAI({ text, className }: { text: string; className?: string }) {
  const { toast } = useToast();

  async function open(target: (typeof TARGETS)[number]) {
    await copyText(text);
    toast({
      title: `Prompt copied — opening ${target.name}`,
      description: "If it doesn't appear in the chat box, just paste it in.",
    });
    window.open(target.buildUrl(text), "_blank", "noopener");
  }

  return (
    <div className={className}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground d-flex items-center gap-1.5">
        Use this prompt in
      </span>
      <div className="flex flex-wrap gap-2">
        {TARGETS.map((target) => (
          <button
            key={target.name}
            type="button"
            onClick={() => open(target)}
            className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
          >
            {target.name}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
