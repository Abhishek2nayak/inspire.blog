"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { describeApiError } from "@/lib/api-error";
import { CHIP_CLASSES, type ChipColor } from "@/lib/categories";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  chip: string;
  order: number;
  counts: { prompts: number; articles: number; tools: number };
}

const CHIP_OPTIONS = Object.keys(CHIP_CLASSES) as ChipColor[];

const label = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5";
const field =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

interface DraftValues {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  chip: ChipColor;
  order: number;
}

const EMPTY: DraftValues = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  chip: "lime",
  order: 0,
};

function CategoryFields({
  draft,
  set,
}: {
  draft: DraftValues;
  set: <K extends keyof DraftValues>(k: K, v: DraftValues[K]) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={label} htmlFor="cat-name">Name</label>
        <input
          id="cat-name"
          className={field}
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="AI Video & Audio"
        />
      </div>
      <div>
        <label className={label} htmlFor="cat-slug">
          Slug <span className="normal-case text-muted-foreground/70">(optional, auto from name)</span>
        </label>
        <input
          id="cat-slug"
          className={cn(field, "font-mono text-xs")}
          value={draft.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="ai-video-audio"
        />
      </div>
      <div>
        <label className={label} htmlFor="cat-tagline">Tagline</label>
        <input
          id="cat-tagline"
          className={field}
          value={draft.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          placeholder="Reels, shorts & voiceovers"
        />
      </div>
      <div>
        <label className={label} htmlFor="cat-chip">Chip colour</label>
        <select
          id="cat-chip"
          className={field}
          value={draft.chip}
          onChange={(e) => set("chip", e.target.value as ChipColor)}
        >
          {CHIP_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="cat-order">Order</label>
        <input
          id="cat-order"
          type="number"
          className={field}
          value={draft.order}
          onChange={(e) => set("order", Number(e.target.value))}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={label} htmlFor="cat-description">Description</label>
        <textarea
          id="cat-description"
          rows={2}
          className={field}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Shown as the intro paragraph on the category's listing pages."
        />
      </div>
    </div>
  );
}

export default function CategoryManager({ initial }: { initial: CategoryRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<DraftValues>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DraftValues>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startEdit(row: CategoryRow) {
    setEditingId(row.id);
    setEditDraft({
      id: row.id,
      name: row.name,
      slug: row.slug,
      tagline: row.tagline ?? "",
      description: row.description ?? "",
      chip: (row.chip as ChipColor) ?? "lime",
      order: row.order,
    });
  }

  async function createCategory() {
    if (!createDraft.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createDraft),
      });
      if (!res.ok) throw new Error(await describeApiError(res));
      const created = await res.json();
      setCategories((prev) =>
        [...prev, { ...created, counts: { prompts: 0, articles: 0, tools: 0 } }].sort(
          (a, b) => a.order - b.order
        )
      );
      setCreating(false);
      setCreateDraft(EMPTY);
      toast({ title: "Category created" });
      router.refresh();
    } catch (e) {
      toast({
        title: "Couldn't create category",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editDraft.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${editDraft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDraft),
      });
      if (!res.ok) throw new Error(await describeApiError(res));
      const updated = await res.json();
      setCategories((prev) =>
        prev
          .map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
          .sort((a, b) => a.order - b.order)
      );
      setEditingId(null);
      toast({ title: "Category updated" });
      router.refresh();
    } catch (e) {
      toast({
        title: "Couldn't save category",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(row: CategoryRow) {
    const total = row.counts.prompts + row.counts.articles + row.counts.tools;
    if (
      total > 0 &&
      !window.confirm(
        `"${row.name}" is used by ${total} item(s). Deleting it leaves them uncategorized. Continue?`
      )
    ) {
      return;
    }
    setDeletingId(row.id);
    try {
      const res = await fetch(`/api/admin/categories/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await describeApiError(res));
      setCategories((prev) => prev.filter((c) => c.id !== row.id));
      toast({ title: "Category deleted" });
      router.refresh();
    } catch (e) {
      toast({
        title: "Couldn't delete category",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} total — used to tag prompts, articles and tools.
          </p>
        </div>
        <button
          onClick={() => {
            setCreating((v) => !v);
            setCreateDraft(EMPTY);
          }}
          className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-lime px-3.5 py-2 text-sm font-semibold text-ink shadow-[2px_2px_0_0_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-lime-deep hover:shadow-none"
        >
          {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {creating ? "Cancel" : "New category"}
        </button>
      </div>

      {creating && (
        <section className="space-y-4 rounded-md border border-border bg-card p-5">
          <CategoryFields draft={createDraft} set={(k, v) => setCreateDraft((p) => ({ ...p, [k]: v }))} />
          <button
            onClick={createCategory}
            disabled={saving}
            className="rounded-md border-2 border-ink bg-lime px-3.5 py-2 text-sm font-semibold text-ink shadow-[2px_2px_0_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create category"}
          </button>
        </section>
      )}

      {categories.length === 0 ? (
        <div className="rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
          <p className="font-display text-lg font-bold text-foreground">No categories yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((row) => {
            const isEditing = editingId === row.id;
            const total = row.counts.prompts + row.counts.articles + row.counts.tools;
            return (
              <div key={row.id} className="rounded-md border border-border bg-card p-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <CategoryFields
                      draft={editDraft}
                      set={(k, v) => setEditDraft((p) => ({ ...p, [k]: v }))}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="rounded-md border-2 border-ink bg-lime px-3.5 py-1.5 text-sm font-semibold text-ink shadow-[2px_2px_0_0_var(--ink)] disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-md border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:border-ink hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "inline-block rounded-sm px-2 py-0.5 text-[11px] font-semibold",
                          CHIP_CLASSES[(row.chip as ChipColor) ?? "lime"] ?? CHIP_CLASSES.lime
                        )}
                      >
                        {row.name}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">/{row.slug}</span>
                      {row.tagline && (
                        <span className="text-xs text-muted-foreground">{row.tagline}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {total} item{total === 1 ? "" : "s"}
                      </span>
                      <button
                        onClick={() => startEdit(row)}
                        aria-label="Edit category"
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:border-ink hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(row)}
                        disabled={deletingId === row.id}
                        aria-label="Delete category"
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive disabled:opacity-50"
                      >
                        {deletingId === row.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
