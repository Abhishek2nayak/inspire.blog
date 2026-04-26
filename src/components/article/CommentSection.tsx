"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getInitials } from "@/lib/date-utils";
import type { CommentWithAuthor } from "@/types";
import { Trash2, CornerDownRight } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  initialComments: CommentWithAuthor[];
}

export default function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleSubmit = async (
    e: React.FormEvent,
    parentId?: string
  ) => {
    e.preventDefault();
    const text = parentId ? replyContent : content;
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text.trim(),
          parentId: parentId || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      const newComment: CommentWithAuthor = await res.json();

      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c
          )
        );
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setComments((prev) => [newComment, ...prev]);
        setContent("");
      }

      toast.success("Comment posted");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string, parentId?: string) => {
    setDeleting(commentId);
    try {
      const res = await fetch(
        `/api/posts/${postId}/comments/${commentId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();

      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: (c.replies || []).filter((r) => r.id !== commentId),
                }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setDeleting(null);
    }
  };

  const currentUserId = (session?.user as { id?: string })?.id;

  const renderComment = (comment: CommentWithAuthor, parentId?: string) => {
    const isAuthor = currentUserId && currentUserId === comment.author.id;
    return (
      <div
        key={comment.id}
        className={parentId ? "ml-8 mt-4 pt-4 border-l-2 border-border pl-4" : "py-6 border-b border-border/50"}
      >
        <div className="flex items-start gap-3">
          <Link href={`/profile/${comment.author.id}`} className="shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={comment.author.image || undefined}
                alt={comment.author.name || ""}
              />
              <AvatarFallback className="text-xs">
                {getInitials(comment.author.name || "U")}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/profile/${comment.author.id}`}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  {comment.author.name}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              {isAuthor && (
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id, parentId)}
                  disabled={deleting === comment.id}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
            {!parentId && session && (
              <button
                type="button"
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
              >
                <CornerDownRight className="h-3 w-3" />
                Reply
              </button>
            )}
          </div>
        </div>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <form
            onSubmit={(e) => handleSubmit(e, comment.id)}
            className="ml-11 mt-3"
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" type="submit" disabled={submitting || !replyContent.trim()}>
                {submitting ? "Posting..." : "Reply"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Replies */}
        {comment.replies?.map((reply) => renderComment(reply, comment.id))}
      </div>
    );
  };

  return (
    <section id="comments" className="mt-12 pb-20 md:pb-0">
      <h2 className="text-xl font-bold text-foreground mb-6">
        Comments ({comments.length})
      </h2>

      {/* Add comment form */}
      {session ? (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-8">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0 mt-0.5">
              <AvatarImage
                src={session.user?.image || undefined}
                alt={session.user?.name || ""}
              />
              <AvatarFallback className="text-xs">
                {getInitials(session.user?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What are your thoughts?"
                rows={3}
                className="w-full rounded-lg border border-input px-4 py-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  type="submit"
                  disabled={submitting || !content.trim()}
                >
                  {submitting ? "Posting..." : "Respond"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>{" "}
            to join the conversation.
          </p>
        </div>
      )}

      {/* Comments list */}
      <div>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </section>
  );
}
