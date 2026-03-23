"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Eye, Heart, MessageCircle, FileText, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostStat {
  id: string;
  title: string;
  slug: string;
  views: number;
  readTime: number;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
  };
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/posts?mine=true");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data.posts || data);
    } catch {
      toast({
        title: "Failed to load analytics",
        description: "Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = posts.reduce((sum, p) => sum + p._count.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p._count.comments, 0);
  const totalPosts = posts.length;

  const maxViews = Math.max(...posts.map((p) => p.views), 1);

  const summaryCards = [
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
    },
    {
      label: "Total Likes",
      value: totalLikes.toLocaleString(),
      icon: Heart,
    },
    {
      label: "Total Comments",
      value: totalComments.toLocaleString(),
      icon: MessageCircle,
    },
    {
      label: "Total Posts",
      value: totalPosts.toString(),
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">
          Analytics
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your content performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="p-5 border border-border rounded-xl">
                <Skeleton className="h-9 w-9 rounded-xl mb-4" />
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))
          : summaryCards.map((card) => (
              <div
                key={card.label}
                className="p-5 border border-border rounded-xl"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <card.icon className="h-4 w-4 text-foreground" />
                </div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
              </div>
            ))}
      </div>

      {/* Post Performance */}
      {!loading && posts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">
              Post Performance
            </h3>
          </div>

          {/* Bar chart visualization */}
          <div className="space-y-3">
            {posts
              .sort((a, b) => b.views - a.views)
              .slice(0, 10)
              .map((post) => (
                <div key={post.id} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-foreground truncate max-w-xs font-medium group-hover:opacity-70 transition-opacity">
                      {post.title || "Untitled"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0 ml-4">
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
                    </div>
                  </div>
                  {/* Bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          (post.views / maxViews) * 100,
                          1
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* Detailed table */}
          <div className="mt-8">
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Views
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Likes
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Comments
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Read Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm text-foreground max-w-[200px] truncate font-medium">
                        {post.title || "Untitled"}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground text-right tabular-nums">
                        {post.views.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground text-right tabular-nums">
                        {post._count.likes}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground text-right hidden sm:table-cell tabular-nums">
                        {post._count.comments}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground text-right hidden sm:table-cell">
                        {post.readTime} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-2xl">
          <div className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-serif font-semibold text-foreground mb-1">
            No data yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Publish posts to see your analytics here.
          </p>
        </div>
      )}
    </div>
  );
}
