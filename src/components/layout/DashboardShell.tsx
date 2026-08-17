"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { FileText, BarChart2, LayoutDashboard, Sparkles, Wand2, Inbox, Tag } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Only routes that actually exist — a nav link to a 404 is worse than none.
// Tool admin screens are still to come.
const navItems = [
  { href: "/dashboard/review", label: "Review queue", icon: Inbox },
  { href: "/dashboard/prompts", label: "Prompts", icon: Sparkles },
  { href: "/dashboard/categories", label: "Categories", icon: Tag },
  { href: "/dashboard/posts", label: "Articles", icon: FileText },
  { href: "/dashboard/generate", label: "AI Writer", icon: Wand2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
];

/**
 * Presentation only. The admin gate lives in the server layout — this
 * component never decides who may see the dashboard.
 */
export default function DashboardShell({
  user,
  children,
}: {
  user: { name: string | null; email: string; image: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper-warm">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-10 md:flex-row">
          <aside className="flex-shrink-0 md:w-60">
            <div className="space-y-6 rounded-md border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback className="bg-muted text-sm font-medium text-muted-foreground">
                    {getInitials(user.name || "A")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <Separator />

              <div>
                <div className="mb-3 flex items-center gap-1.5 px-2">
                  <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Dashboard
                  </span>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-lime text-ink"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <Separator />

              <div className="space-y-1">
                <Link
                  href="/editor/new"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <span className="text-lg leading-none">+</span>
                  New article
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Settings
                </Link>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 rounded-md border border-border bg-card p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
