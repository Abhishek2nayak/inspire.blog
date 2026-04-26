"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  Edit,
  Trash2,
  Eye,
  Heart,
  MessageCircle,
  PenLine,
  FileText,
  Plus,
} from "lucide-react";

type PostStatus = "all" | "published" | "draft";

interface DashboardPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  views: number;
  _count: {
    likes: number;
    comments: number;
  };
}

const tabs: { key: PostStatus; label: string }[] = [
  { key: "all", label: "All Posts" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
];

export default function DashboardPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<DashboardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PostStatus>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts?mine=true&include_drafts=true");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data.posts || data);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== deleteId));
      toast("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "published") return post.published;
    if (filter === "draft") return !post.published;
    return true;
  });

  const postToDelete = posts.find((p) => p.id === deleteId);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Your Posts
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage and track all your content
            </p>
          </div>
          <Link href="/editor/new">
            <Button className="bg-foreground text-background hover:opacity-90 gap-1.5">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-all border-b-2 cursor-pointer",
                filter === tab.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {!loading && (
                <span
                  className={cn(
                    "ml-2 px-1.5 py-0.5 text-xs rounded-full",
                    filter === tab.key
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.key === "all"
                    ? posts.length
                    : tab.key === "published"
                      ? posts.filter((p) => p.published).length
                      : posts.filter((p) => !p.published).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-border rounded-xl"
              >
                <div className="flex-1 space-y-2 mr-4">
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-border">
            <div className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-serif font-semibold text-foreground mb-1">
              {filter === "draft"
                ? "No drafts"
                : filter === "published"
                  ? "No published posts"
                  : "No posts yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              {filter === "draft"
                ? "Start writing and save as draft."
                : filter === "published"
                  ? "Publish your first post to see it here."
                  : "Create your first post and share your ideas."}
            </p>
            <Link href="/editor/new">
              <Button variant="outline">
                <PenLine className="h-4 w-4 mr-1.5" />
                Write a post
              </Button>
            </Link>
          </div>
        )}

        {/* Posts List */}
        {!loading && filteredPosts.length > 0 && (
          <div className="space-y-2.5">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-foreground/30 hover:shadow-sm transition-all group"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Link
                      href={
                        post.published
                          ? `/article/${post.slug}`
                          : `/editor/${post.id}`
                      }
                      className="font-medium text-foreground hover:opacity-70 transition-opacity truncate text-sm"
                    >
                      {post.title || "Untitled Draft"}
                    </Link>
                    <Badge
                      variant={post.published ? "default" : "secondary"}
                      className={cn(
                        "flex-shrink-0 text-xs",
                        post.published
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(post.createdAt)}</span>
                    {post.published && (
                      <>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post._count.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post._count.comments}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/editor/${post.id}`)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    aria-label="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(post.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {postToDelete?.title || "this post"}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
