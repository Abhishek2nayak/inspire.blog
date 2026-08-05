"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMyArticles, useDeleteArticle, type DashboardArticle } from "@/hooks/use-articles";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate, cn } from "@/lib/utils";
import { Edit, Trash2, Eye, MessageCircle, PenLine, FileText, Plus } from "lucide-react";

type Tab = "all" | "published" | "draft";

const tabs: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
];

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-chip-green text-chip-green-fg",
  DRAFT: "bg-muted text-muted-foreground",
  REVIEW: "bg-chip-yellow text-chip-yellow-fg",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default function DashboardPostsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Tab>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Shares its cache entry with /dashboard/analytics — see hooks/query-keys.ts.
  const { data, isPending: loading, isError } = useMyArticles(true);
  const articles: DashboardArticle[] = data ?? [];

  const deleteArticle = useDeleteArticle();
  const deleting = deleteArticle.isPending;

  // The toast lives in an effect rather than in the query, because React Query
  // retries and refetches on its own schedule — firing it from queryFn would
  // stack duplicate toasts on every retry.
  useEffect(() => {
    if (isError) {
      toast({
        title: "Failed to load articles",
        description: "Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteArticle.mutate(deleteId, {
      onSuccess: () => toast({ title: "Article deleted" }),
      onError: (e) =>
        toast({
          title: "Failed to delete",
          description: e instanceof Error ? e.message : "Please try again.",
          variant: "destructive",
        }),
      onSettled: () => setDeleteId(null),
    });
  };

  const isPublished = (a: DashboardArticle) => a.status === "PUBLISHED";

  const filtered = articles.filter((a) => {
    if (filter === "published") return isPublished(a);
    if (filter === "draft") return !isPublished(a);
    return true;
  });

  const toDelete = articles.find((a) => a.id === deleteId);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Articles</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Tutorials, guides and roundups
            </p>
          </div>
          <Link href="/editor/new">
            <Button variant="riso" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New article
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition-all",
                filter === tab.key
                  ? "border-ink text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {!loading && (
                <span
                  className={cn(
                    "ml-2 rounded-sm px-1.5 py-0.5 text-xs",
                    filter === tab.key ? "bg-ink text-bone" : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.key === "all"
                    ? articles.length
                    : tab.key === "published"
                      ? articles.filter(isPublished).length
                      : articles.filter((a) => !isPublished(a)).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border border-border p-4"
              >
                <div className="mr-4 flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-md border border-border bg-muted/30 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md border-2 border-ink bg-card">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-1 font-display font-bold text-foreground">
              {filter === "draft"
                ? "No drafts"
                : filter === "published"
                  ? "Nothing published"
                  : "No articles yet"}
            </h3>
            <Link href="/editor/new">
              <Button variant="outline" className="mt-3">
                <PenLine className="mr-1.5 h-4 w-4" />
                Write one
              </Button>
            </Link>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-2.5">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="group flex items-center justify-between rounded-md border border-border bg-card p-4 transition-colors hover:border-ink"
              >
                <div className="mr-4 min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2.5">
                    <Link
                      href={isPublished(a) ? `/article/${a.slug}` : `/editor/${a.id}`}
                      className="truncate text-sm font-medium text-foreground hover:underline"
                    >
                      {a.title || "Untitled draft"}
                    </Link>
                    <span
                      className={cn(
                        "flex-shrink-0 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold",
                        STATUS_STYLE[a.status]
                      )}
                    >
                      {a.status.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(a.createdAt)}</span>
                    {isPublished(a) && (
                      <>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {a.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {a._count?.comments ?? 0}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/editor/${a.id}`)}
                    className="h-8 w-8"
                    aria-label="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(a.id)}
                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete article</DialogTitle>
            <DialogDescription>
              Delete &quot;{toDelete?.title || "this article"}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
