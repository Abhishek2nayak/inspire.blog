"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Paywall for a paid prompt.
 *
 * Only the teaser is passed in — the full body never leaves the server for a
 * user who hasn't bought it, so there is nothing to reveal in devtools.
 */
export default function LockedPrompt({
  promptId,
  teaser,
  priceLabel,
  charCount,
}: {
  promptId: string;
  teaser: string;
  priceLabel: string;
  charCount: number;
}) {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function buy() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/prompts/${promptId}/purchase`, { method: "POST" });
      const data = await res.json();

      if (res.status === 501) {
        // Payments aren't wired yet — say so plainly rather than failing oddly.
        toast({
          title: "Checkout isn't live yet",
          description: data.error,
        });
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Purchase failed");

      toast({ title: "Unlocked", description: "The full prompt is now visible." });
      router.refresh();
    } catch (e) {
      toast({
        title: "Couldn't complete the purchase",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-md border-2 border-ink bg-paper-cool">
      <div className="relative">
        <pre className="whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-relaxed text-foreground sm:p-5">
          {teaser}…
        </pre>
        {/* Fades the teaser out rather than cutting it hard. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper-cool to-transparent" />
      </div>

      <div className="border-t-2 border-ink bg-paper-cool-2 px-4 py-4 text-center">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Lock className="h-3.5 w-3.5" />
          {charCount} characters — full prompt locked
        </p>
        <button
          type="button"
          onClick={buy}
          disabled={busy}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-ink bg-lime px-5 py-2.5 text-sm font-semibold text-ink shadow-[3px_3px_0_0_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-lime-deep hover:shadow-[2px_2px_0_0_var(--ink)] disabled:opacity-60 sm:w-auto"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Unlock for {priceLabel}
        </button>
        <p className="mt-2 text-[11px] text-muted-foreground">
          One-time purchase · yours forever
        </p>
      </div>
    </div>
  );
}
