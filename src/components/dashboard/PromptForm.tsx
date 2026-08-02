"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Trash2, Upload, ExternalLink, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { OUTPUT_TYPES, DIFFICULTIES } from "@/lib/prompts";
import { describeApiError } from "@/lib/api-error";

interface ExampleRow {
  id: string;
  url: string;
  alt: string | null;
  isVideo: boolean;
}

export interface PromptFormValues {
  id?: string;
  title: string;
  slug: string;
  body: string;
  negative: string;
  description: string;
  tips: string;
  kind: "IMAGE" | "VIDEO" | "TEXT";
  outputType: string;
  difficulty: string;
  aspectRatio: string;
  parameters: string;
  modelSlug: string;
  categorySlug: string;
  tags: string;
  status: string;
  featured: boolean;
}

const label = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5";
const field =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export default function PromptForm({
  initial,
  models,
  categories,
  examples = [],
}: {
  initial: PromptFormValues;
  models: { slug: string; name: string }[];
  categories: { slug: string; name: string }[];
  examples?: ExampleRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [v, setV] = useState<PromptFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rows, setRows] = useState<ExampleRow[]>(examples);

  const isNew = !v.id;
  const set = <K extends keyof PromptFormValues>(k: K, val: PromptFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const payload = () => ({
    ...v,
    tags: v.tags.split(",").map((t) => t.trim()).filter(Boolean),
  });

  async function save(nextStatus?: string) {
    setSaving(true);
    try {
      const res = await fetch(
        isNew ? "/api/admin/prompts" : `/api/admin/prompts/${v.id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload(),
            ...(nextStatus ? { status: nextStatus } : {}),
          }),
        }
      );
      console.log("[prompt save] HTTP", res);

      if (!res.ok) {
        // Do NOT call res.json() before checking ok — a 500 returns HTML and
        // the throw would hide the real reason behind a generic message.
        const description = await describeApiError(res);
        console.error(`[prompt save] HTTP ${res.status}:`, description);
        toast({
          title: res.status === 422 ? "Can't publish yet" : `Couldn't save (${res.status})`,
          description,
          variant: "destructive",
        });
        return;
      }

      const data = await res.json();

      toast({
        title: nextStatus === "PUBLISHED" ? "Published" : "Saved",
        description: nextStatus === "PUBLISHED" ? "It's live on the site." : undefined,
      });

      if (isNew) router.push(`/dashboard/prompts/${data.id}`);
      else router.refresh();
    } catch (e) {
      console.error("[prompt save] network error:", e);
      toast({
        title: "Couldn't reach the server",
        description: e instanceof Error ? e.message : "Check your connection and retry.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function uploadExample(file: File) {
    if (!v.id) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      if (!up.ok) throw new Error(await describeApiError(up));
      const upData = await up.json();

      const res = await fetch(`/api/admin/prompts/${v.id}/examples`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: upData.url ?? upData.secure_url,
          width: upData.width,
          height: upData.height,
          alt: v.title,
        }),
      });
      if (!res.ok) throw new Error(await describeApiError(res));
      const row = await res.json();

      setRows((r) => [...r, row]);
      toast({ title: "Example added" });
    } catch (e) {
      toast({
        title: "Upload failed",
        description:
          e instanceof Error ? e.message : "Check your Cloudinary env vars are set.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function removeExample(exampleId: string) {
    if (!v.id) return;
    const res = await fetch(
      `/api/admin/prompts/${v.id}/examples?exampleId=${exampleId}`,
      { method: "DELETE" }
    );
    if (res.ok) setRows((r) => r.filter((x) => x.id !== exampleId));
  }

  const canPublish = rows.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">
          {isNew ? "New prompt" : "Edit prompt"}
        </h1>
        <div className="flex items-center gap-2">
          {!isNew && v.status === "PUBLISHED" && (
            <Link
              href={`/prompts/${v.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-ink hover:text-foreground"
            >
              View <ExternalLink className="h-3 w-3" />
            </Link>
          )}
          <button
            onClick={() => save()}
            disabled={saving}
            className="rounded-md border-2 border-ink px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save draft"}
          </button>
          {!isNew && v.status !== "PUBLISHED" && (
            <button
              onClick={() => save("PUBLISHED")}
              disabled={saving || !canPublish}
              title={canPublish ? undefined : "Add an example image first"}
              className="rounded-md border-2 border-ink bg-lime px-3.5 py-2 text-sm font-semibold text-ink shadow-[2px_2px_0_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {isNew && (
        <p className="rounded-md border-l-4 border-ink bg-paper-cool px-4 py-2.5 text-xs text-muted-foreground">
          Save the draft first, then you can attach the example image it produced.
        </p>
      )}

      {!isNew && !canPublish && (
        <p className="flex items-start gap-2 rounded-md border-l-4 border-ink bg-paper-warm px-4 py-2.5 text-xs text-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-text" />
          <span>
            Run this prompt in the tool, then upload the result below. Publishing is blocked
            until there&apos;s at least one example — a prompt with no output is
            unconvincing to readers.
          </span>
        </p>
      )}

      {/* ── The prompt itself ── */}
      <section className="space-y-4 rounded-md border border-border bg-card p-5">
        <div>
          <label className={label} htmlFor="title">Title</label>
          <input id="title" className={field} value={v.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="High-contrast YouTube thumbnail with a reacting face" />
        </div>

        <div>
          <label className={label} htmlFor="body">Prompt text (what people copy)</label>
          <textarea id="body" rows={7} className={cn(field, "font-mono text-[13px]")}
            value={v.body} onChange={(e) => set("body", e.target.value)}
            placeholder="Close-up portrait of a person with an exaggerated surprised expression…" />
        </div>

        <div>
          <label className={label} htmlFor="negative">Negative prompt (optional)</label>
          <textarea id="negative" rows={2} className={cn(field, "font-mono text-[13px]")}
            value={v.negative} onChange={(e) => set("negative", e.target.value)}
            placeholder="text, watermark, blurry face" />
        </div>

        <div>
          <label className={label} htmlFor="description">Short description</label>
          <textarea id="description" rows={2} className={field} value={v.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What this produces and when to reach for it." />
        </div>

        <div>
          <label className={label} htmlFor="tips">Tips (HTML allowed)</label>
          <textarea id="tips" rows={4} className={field} value={v.tips}
            onChange={(e) => set("tips", e.target.value)}
            placeholder="<p>Swap the expression to match the video…</p>" />
        </div>
      </section>

      {/* ── Classification ── */}
      <section className="grid gap-4 rounded-md border border-border bg-card p-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="outputType">What is it for</label>
          <select id="outputType" className={field} value={v.outputType}
            onChange={(e) => set("outputType", e.target.value)}>
            {OUTPUT_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="modelSlug">AI model</label>
          <select id="modelSlug" className={field} value={v.modelSlug}
            onChange={(e) => set("modelSlug", e.target.value)}>
            <option value="">— none —</option>
            {models.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="categorySlug">Topic</label>
          <select id="categorySlug" className={field} value={v.categorySlug}
            onChange={(e) => set("categorySlug", e.target.value)}>
            <option value="">— none —</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="kind">Type</label>
          <select id="kind" className={field} value={v.kind}
            onChange={(e) => set("kind", e.target.value as PromptFormValues["kind"])}>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
            <option value="TEXT">Text</option>
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
          <label className={label} htmlFor="parameters">Parameters</label>
          <input id="parameters" className={cn(field, "font-mono text-xs")} value={v.parameters}
            onChange={(e) => set("parameters", e.target.value)}
            placeholder="--ar 16:9 --style raw" />
        </div>

        <div>
          <label className={label} htmlFor="tags">Tags (comma separated)</label>
          <input id="tags" className={field} value={v.tags}
            onChange={(e) => set("tags", e.target.value)} placeholder="thumbnail, youtube" />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={v.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="h-4 w-4 rounded-sm border-input" />
          Feature on the homepage
        </label>
      </section>

      {/* ── Examples ── */}
      {!isNew && (
        <section className="rounded-md border border-border bg-card p-5">
          <h2 className="mb-1 font-display text-lg font-bold text-foreground">
            Example output
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Run the prompt, then upload what it produced. This is what readers see first.
          </p>

          {rows.length > 0 && (
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              {rows.map((r) => (
                <div key={r.id} className="group relative overflow-hidden rounded-md border-2 border-ink">
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image src={r.url} alt={r.alt ?? ""} fill sizes="200px" className="object-cover" />
                  </div>
                  <button
                    onClick={() => removeExample(r.id)}
                    aria-label="Remove example"
                    className="absolute right-1.5 top-1.5 rounded-sm border border-ink bg-bone/90 p-1 text-ink opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-md border-2 border-dashed border-rule-strong px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-ink hover:text-foreground",
              uploading && "pointer-events-none opacity-60"
            )}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload example image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadExample(f);
                e.target.value = "";
              }}
            />
          </label>
        </section>
      )}
    </div>
  );
}
