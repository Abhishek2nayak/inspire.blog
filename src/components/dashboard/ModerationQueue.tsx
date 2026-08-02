"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/prompt-access";
import { getOutputTypeByValue } from "@/lib/prompts";
import { describeApiError } from "@/lib/api-error";

export interface PendingPrompt {
  id: string;
  title: string;
  slug: string;
  body: string;
  description: string | null;
  outputType: string;
  priceCents: number;
  currency: string;
  submittedAt: string | null;
  author: { name: string | null; email: string };
  model: { name: string } | null;
  examples: { id: string; url: string }[];
}

export default function ModerationQueue({ initial }: { initial: PendingPrompt[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function moderate(id: string, action: "approve" | "reject", why?: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/prompts/${id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: why }),
      });
      if (!res.ok) {
        const description = await describeApiError(res);
        console.error(`[moderate] HTTP ${res.status}:`, description);
        toast({ title: `Couldn't do that (${res.status})`, description, variant: "destructive" });
        return;
      }
      await res.json();
      setItems((p) => p.filter((x) => x.id !== id));
      setRejecting(null);
      setReason("");
      toast({ title: action === "approve" ? "Approved and published" : "Rejected" });
      router.refresh();
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
        <p className="font-display text-lg font-bold text-foreground">Queue is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Nothing waiting for review right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((p) => {
        const output = getOutputTypeByValue(p.outputType);
        return (
          <article key={p.id} className="card-framed overflow-hidden">
            <div className="border-b-2 border-ink bg-paper-warm px-5 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-foreground">{p.title}</h3>
                <span className="rounded-sm border-2 border-ink bg-lime px-2 py-0.5 text-sm font-bold text-ink">
                  {formatPrice(p.priceCents, p.currency)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {p.author.name || p.author.email} · {output?.short ?? p.outputType}
                {p.model && <> · {p.model.name}</>}
              </p>
            </div>

            {p.examples.length > 0 && (
              <div className="grid grid-cols-3 gap-2 border-b border-border p-3 sm:grid-cols-5">
                {p.examples.map((e) => (
                  <div key={e.id} className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted">
                    <Image src={e.url} alt="" fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 p-5">
              {p.description && (
                <p className="text-sm text-muted-foreground">{p.description}</p>
              )}
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-paper-cool p-3 font-mono text-xs text-foreground">
                {p.body}
              </pre>
            </div>

            {rejecting === p.id ? (
              <div className="space-y-2 border-t border-border bg-muted/40 p-4">
                <label htmlFor={`reason-${p.id}`} className="text-xs font-semibold text-foreground">
                  Why are you rejecting it? The seller sees this.
                </label>
                <textarea
                  id={`reason-${p.id}`}
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. The example images don't match the prompt."
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => moderate(p.id, "reject", reason)}
                    disabled={busy === p.id || !reason.trim()}
                    className="rounded-md border-2 border-ink bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground disabled:opacity-50"
                  >
                    Confirm reject
                  </button>
                  <button
                    onClick={() => { setRejecting(null); setReason(""); }}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/40 p-4">
                <button
                  onClick={() => moderate(p.id, "approve")}
                  disabled={busy === p.id}
                  className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-lime px-3.5 py-2 text-sm font-semibold text-ink shadow-[2px_2px_0_0_var(--ink)] disabled:opacity-60"
                >
                  {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approve &amp; publish
                </button>
                <button
                  onClick={() => setRejecting(p.id)}
                  disabled={busy === p.id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:border-ink hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
                <Link
                  href={`/dashboard/prompts/${p.id}`}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-link hover:underline"
                >
                  Edit first <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
