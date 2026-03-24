"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BlogEditor from "@/components/editor/BlogEditor";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

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
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          subtitle: data.subtitle || undefined,
          content: data.content,
          contentMd: data.contentMd,
          coverImage: data.coverImage,
          tags: data.tags,
          published: data.published,
          metaTitle: data.metaTitle || undefined,
          metaDesc: data.metaDesc || undefined,
          canonicalUrl: data.canonicalUrl || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast({ title: result.error || "Failed to create post", variant: "destructive" });
        return;
      }

      toast({ title: data.published ? "Published!" : "Draft saved!" });
      router.push(`/article/${result.slug || result.id}`);
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      {/* Edit mode indicator */}
      <div className="sticky top-14 z-40 border-b border-amber-200 bg-amber-50 px-4 py-2">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            New post
          </span>
          <span className="text-xs text-amber-700">Drafts auto-save every 2 seconds</span>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <BlogEditor onSave={handleSave} saving={saving} />
      </div>
    </>
  );
}
