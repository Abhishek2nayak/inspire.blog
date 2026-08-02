"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { OUTPUT_TYPES, DIFFICULTIES } from "@/lib/prompts";
import { siteConfig } from "@/lib/site-config";

const MAX_IMAGES = 5;

interface Img {
  url: string;
  width?: number;
  height?: number;
}

const label = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5";
const field =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export default function SellPromptForm({
  models,
  categories,
}: {
  models: { slug: string; name: string }[];
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [images, setImages] = useState<Img[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [priceDollars, setPriceDollars] = useState("0");

  const [v, setV] = useState({
    title: "",
    body: "",
    negative: "",
    description: "",
    kind: "IMAGE" as "IMAGE" | "VIDEO" | "TEXT",
    outputType: "YOUTUBE_THUMBNAIL",
    difficulty: "BEGINNER",
    aspectRatio: "",
    parameters: "",
    modelSlug: "",
    categorySlug: "",
    tags: "",
  });

  const set = (k: keyof typeof v, val: string) => setV((p) => ({ ...p, [k]: val }));

  async function upload(file: File) {
    if (images.length >= MAX_IMAGES) {
      toast({ title: `Maximum ${MAX_IMAGES} images`, variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImages((p) => [...p, { url: data.url, width: data.width, height: data.height }]);
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    try {
      // Parsed to integer cents — money is never stored as a float.
      const priceCents = siteConfig.paidPromptsEnabled
        ? Math.round(parseFloat(priceDollars || "0") * 100)
        : 0;

      const res = await fetch("/api/prompts/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...v,
          priceCents,
          images,
          tags: v.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Couldn't submit", description: data.error, variant: "destructive" });
        return;
      }
      setDone(true);
    } catch {
      toast({ title: "Couldn't submit", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card-framed mx-auto max-w-lg p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-text" />
        <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
          Submitted for review
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We review every prompt before it goes live — usually within a day. You&apos;ll see it
          in the library once it&apos;s approved.
        </p>
        <button
          onClick={() => router.push("/prompts")}
          className="mt-6 rounded-md border-2 border-ink bg-lime px-4 py-2 text-sm font-semibold text-ink"
        >
          Browse the library
        </button>
      </div>
    );
  }

  const priceNum = parseFloat(priceDollars || "0");
  const earns = Number.isFinite(priceNum) ? (priceNum * 0.8).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-md border border-border bg-card p-5">
        <div>
          <label className={label} htmlFor="title">Title</label>
          <input id="title" className={field} value={v.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Cinematic YouTube thumbnail with dramatic rim lighting" />
        </div>

        <div>
          <label className={label} htmlFor="body">The prompt</label>
          <textarea id="body" rows={7} className={cn(field, "font-mono text-[13px]")}
            value={v.body} onChange={(e) => set("body", e.target.value)}
            placeholder="Write the full prompt exactly as it should be pasted…" />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {v.body.length} characters — minimum 40
          </p>
        </div>

        <div>
          <label className={label} htmlFor="description">What it produces</label>
          <textarea id="description" rows={2} className={field} value={v.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="One or two lines buyers will read before purchasing." />
        </div>

        <div>
          <label className={label} htmlFor="negative">Negative prompt (optional)</label>
          <input id="negative" className={cn(field, "font-mono text-xs")} value={v.negative}
            onChange={(e) => set("negative", e.target.value)} />
        </div>
      </section>

      {/* ── Images: the trust signal, so it gets its own prominent block ── */}
      <section className="rounded-md border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold text-foreground">
          Example outputs
        </h2>
        <p className="mb-4 mt-1 text-xs text-muted-foreground">
          Up to {MAX_IMAGES} images. Buyers see every one of these before paying — this is what
          convinces them the prompt works.
        </p>

        {images.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {images.map((img, i) => (
              <div key={img.url} className="group relative overflow-hidden rounded-md border-2 border-ink">
                <div className="relative aspect-square bg-muted">
                  <Image src={img.url} alt="" fill sizes="150px" className="object-cover" />
                </div>
                <button
                  onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 rounded-sm border border-ink bg-bone/90 p-1 text-ink opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < MAX_IMAGES && (
          <label
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-md border-2 border-dashed border-rule-strong px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-ink hover:text-foreground",
              uploading && "pointer-events-none opacity-60"
            )}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : `Add image (${images.length}/${MAX_IMAGES})`}
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }} />
          </label>
        )}
      </section>

      {/* ── Pricing ── */}
      {siteConfig.paidPromptsEnabled ? (
      <section className="rounded-md border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">Price</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className={label} htmlFor="price">Price (USD)</label>
            <input id="price" type="number" min="0" step="0.5" className={cn(field, "w-32")}
              value={priceDollars} onChange={(e) => setPriceDollars(e.target.value)} />
          </div>
          <p className="pb-2 text-xs text-muted-foreground">
            {priceNum > 0 ? (
              <>You keep <strong className="text-foreground">${earns}</strong> per sale (80%).</>
            ) : (
              <>Set to 0 to list it free.</>
            )}
          </p>
        </div>
      </section>
      ) : (
        <p className="rounded-md border-l-4 border-ink bg-paper-cool px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Paid listings aren&apos;t open yet.</strong>{" "}
          Everything submitted now is published free. Selling switches on once checkout is
          live — your listings will still be yours to price then.
        </p>
      )}

      {/* ── Classification ── */}
      <section className="grid gap-4 rounded-md border border-border bg-card p-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="outputType">What does it make</label>
          <select id="outputType" className={field} value={v.outputType}
            onChange={(e) => set("outputType", e.target.value)}>
            {OUTPUT_TYPES.map((o) => <option key={o.value} value={o.value}>{o.name}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="modelSlug">AI model</label>
          <select id="modelSlug" className={field} value={v.modelSlug}
            onChange={(e) => set("modelSlug", e.target.value)}>
            <option value="">— select —</option>
            {models.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="categorySlug">Topic</label>
          <select id="categorySlug" className={field} value={v.categorySlug}
            onChange={(e) => set("categorySlug", e.target.value)}>
            <option value="">— select —</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="difficulty">Level</label>
          <select id="difficulty" className={field} value={v.difficulty}
            onChange={(e) => set("difficulty", e.target.value)}>
            {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="aspectRatio">Aspect ratio</label>
          <input id="aspectRatio" className={field} value={v.aspectRatio}
            onChange={(e) => set("aspectRatio", e.target.value)} placeholder="16:9" />
        </div>
        <div>
          <label className={label} htmlFor="tags">Tags (comma separated)</label>
          <input id="tags" className={field} value={v.tags}
            onChange={(e) => set("tags", e.target.value)} placeholder="thumbnail, cinematic" />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={submit}
          disabled={submitting || images.length === 0 || v.body.length < 40 || v.title.length < 8}
          className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-lime px-5 py-2.5 text-sm font-semibold text-ink shadow-[3px_3px_0_0_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit for review
        </button>
        {images.length === 0 && (
          <p className="text-xs text-muted-foreground">Add at least one example image first.</p>
        )}
      </div>
    </div>
  );
}
