"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BlogEditor from "@/components/editor/BlogEditor";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PostData {
  id?: string;
  title: string;
  excerpt?: string;
  content: string;
  contentMd?: string;
  slug: string;
  coverImage?: string;
  metaTitle?: string;
  tags?: { tag: { name: string } }[] | string[];
  published?: boolean;
  author?: { id?: string; email?: string };
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/posts/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setPost(data.post || data))
      .catch(() => { toast({ title: "Post not found", variant: "destructive" }); router.push("/"); })
      .finally(() => setLoading(false));
  }, [id, status, router, toast]);

  useEffect(() => {
    if (!post || !session?.user) return;
    const authorId = post.author?.id || post.author?.email;
    const userId = (session.user as { id?: string }).id || session.user.email;
    if (authorId && userId && authorId !== userId) {
      toast({ title: "You can only edit your own posts", variant: "destructive" });
      router.push("/");
    }
  }, [post, session, router, toast]);

  const handleSave = async (data: {
    title: string;
    subtitle: string;
    content: string;
    contentMd: string;
    coverImage?: string;
    tags: string[];
    published: boolean;
    metaTitle: string;
    metaDesc: string;
    canonicalUrl: string;
  }) => {
    if (!data.title.trim()) {
      toast({ title: "Please add a title", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          subtitle: data.subtitle || undefined,
          content: data.content,
          contentMd: data.contentMd,
          coverImage: data.coverImage || undefined,
          tags: data.tags.length > 0 ? data.tags : undefined,
          published: data.published,
          metaTitle: data.metaTitle || undefined,
          metaDesc: data.metaDesc || undefined,
          canonicalUrl: data.canonicalUrl || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) { toast({ title: result.error || "Failed to update", variant: "destructive" }); return; }
      toast({ title: data.published ? "Post published!" : "Draft saved!" });
      router.push(`/article/${result.slug || result.id || id}`);
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session || !post) return null;

  const initialTags = post.tags
    ? post.tags.map((t) => (typeof t === "string" ? t : (t as { tag: { name: string } }).tag.name))
    : [];

  return (
    <>
      {/* Edit mode indicator */}
      <div className="sticky top-14 z-40 border-b border-blue-200 bg-blue-50 px-4 py-2">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Editing
            </span>
            <span className="truncate text-xs text-blue-700 max-w-xs">{post.title}</span>
          </div>
          <a
            href={post.slug ? `/article/${post.slug}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline shrink-0"
          >
            View published ↗
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <BlogEditor
          initialTitle={post.title}
          initialSubtitle={post.excerpt ?? ""}
          initialContent={post.content}
          initialContentMd={post.contentMd}
          postId={id}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </>
  );
}
