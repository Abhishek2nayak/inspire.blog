"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Rss,
  LayoutDashboard,
  Settings,
  PenSquare,
  Search,
  BookOpen,
  Hash,
  Clock,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const RECENT_POSTS_KEY = "blogosphere_recent_posts";

interface RecentPost {
  title: string;
  slug: string;
}

const NAVIGATION_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Feed", href: "/feed", icon: Rss },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Series", href: "/series", icon: BookOpen },
  { label: "Tags", href: "/tags", icon: Hash },
];

const ACTION_ITEMS = [
  { label: "New Post", href: "/editor/new", icon: PenSquare, shortcut: "N" },
  { label: "Search", href: "/search", icon: Search },
];

interface CommandMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandMenu({ open: controlledOpen, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);

  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setOpen;

  // Load recent posts from localStorage when menu opens
  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem(RECENT_POSTS_KEY);
      if (stored) setRecentPosts(JSON.parse(stored));
    } catch {}
  }, [isOpen]);

  // Global Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  const runCommand = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router, setIsOpen]
  );

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Search anything..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation section */}
        <CommandGroup heading="Navigation">
          {NAVIGATION_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              value={item.label}
              onSelect={() => runCommand(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Recent posts section */}
        {recentPosts.length > 0 && (
          <>
            <CommandGroup heading="Recently Viewed">
              {recentPosts.slice(0, 5).map((post) => (
                <CommandItem
                  key={post.slug}
                  value={post.title}
                  onSelect={() => runCommand(`/article/${post.slug}`)}
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{post.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Actions section */}
        <CommandGroup heading="Actions">
          {ACTION_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              value={item.label}
              onSelect={() => runCommand(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {item.label}
              {item.shortcut && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {item.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export default CommandMenu;
