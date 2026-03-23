"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, Check, Heart, MessageCircle, UserPlus } from "lucide-react";
import { formatDate, getInitials, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "reply";
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    image?: string | null;
  };
  post?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  comment?: {
    id: string;
    content: string;
  } | null;
}

interface GroupedNotifications {
  [key: string]: Notification[];
}

function getActionText(notification: Notification): string {
  switch (notification.type) {
    case "like":
      return "liked your article";
    case "comment":
      return "commented on your article";
    case "reply":
      return "replied to your comment on";
    case "follow":
      return "started following you";
    default:
      return "interacted with you";
  }
}

function getActionIcon(type: Notification["type"]) {
  switch (type) {
    case "like":
      return <Heart className="h-3.5 w-3.5 text-red-500" />;
    case "comment":
    case "reply":
      return <MessageCircle className="h-3.5 w-3.5 text-blue-500" />;
    case "follow":
      return <UserPlus className="h-3.5 w-3.5 text-foreground" />;
    default:
      return <Bell className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function groupByDate(notifications: Notification[]): GroupedNotifications {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: GroupedNotifications = {};

  for (const notification of notifications) {
    const date = new Date(notification.createdAt);
    date.setHours(0, 0, 0, 0);

    let groupKey: string;
    if (date.getTime() === today.getTime()) {
      groupKey = "Today";
    } else if (date.getTime() === yesterday.getTime()) {
      groupKey = "Yesterday";
    } else {
      groupKey = "Earlier";
    }

    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(notification);
  }

  return groups;
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-4 border-b border-border">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data.notifications || data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    setMarkingRead(true);
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!res.ok) throw new Error("Failed to mark as read");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      toast({ title: "All notifications marked as read" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    } finally {
      setMarkingRead(false);
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const grouped = groupByDate(notifications);
  const groupOrder = ["Today", "Yesterday", "Earlier"];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={markingRead}
            className="gap-1.5"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="rounded-xl border border-border overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/30 py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-5">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            No notifications yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            When someone likes, comments, or follows you, you&apos;ll see it here.
          </p>
        </div>
      )}

      {/* Grouped notifications */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-6">
          {groupOrder.map((group) => {
            const items = grouped[group];
            if (!items || items.length === 0) return null;
            return (
              <div key={group}>
                <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </h2>
                <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                  {items.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (!notification.read) markOneRead(notification.id);
                      }}
                      className={cn(
                        "flex items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/30 cursor-default",
                        !notification.read && "bg-accent/40"
                      )}
                    >
                      {/* Avatar with action badge */}
                      <div className="relative shrink-0">
                        <Avatar className="h-10 w-10">
                          {notification.actor.image && (
                            <AvatarImage
                              src={notification.actor.image}
                              alt={notification.actor.name}
                            />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {getInitials(notification.actor.name || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-background">
                          {getActionIcon(notification.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug">
                          <Link
                            href={`/profile/${notification.actor.id}`}
                            className="font-semibold hover:underline"
                          >
                            {notification.actor.name}
                          </Link>{" "}
                          {getActionText(notification)}
                          {notification.post && (
                            <>
                              {" "}
                              <Link
                                href={`/article/${notification.post.slug}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {notification.post.title}
                              </Link>
                            </>
                          )}
                        </p>
                        {notification.comment && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1 italic">
                            &ldquo;{notification.comment.content}&rdquo;
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notification.read && (
                        <span className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
