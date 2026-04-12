"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  Bell,
  PenSquare,
  Menu,
  X,
  LogOut,
  Settings,
  LayoutDashboard,
  User,
  Bookmark,
  ChevronDown,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const unreadNotifications = 0;
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const user = session?.user;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
      setSearchOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm transition-shadow duration-200",
        scrolled ? "shadow-sm border-border" : "border-border/50"
      )}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">

        {/* Logo */}
        <Logo className="mr-2 shrink-0" size="md" />

        {/* Nav links — desktop */}
        <div className="hidden items-center gap-0.5 md:flex">
          <NavLink href="/feed">Explore</NavLink>
          {isLoggedIn && <NavLink href="/bookmarks">Bookmarks</NavLink>}
        </div>

        <div className="flex-1" />

        {/* Search — desktop */}
        <div className="hidden md:block">
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                autoFocus
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onBlur={() => { if (!searchValue) setSearchOpen(false); }}
                placeholder="Search…"
                className="w-52 rounded-lg border border-border bg-muted/60 py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              />
            </form>
          ) : (
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="hidden rounded border border-border bg-background px-1 py-0.5 text-[10px] font-medium sm:inline-flex">
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {isLoggedIn ? (
            <>
              {/* Write button */}
              <button
                onClick={() => router.push("/editor/new")}
                className="hidden items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:flex"
              >
                <PenSquare className="h-3.5 w-3.5" />
                Write
              </button>

              {/* Notifications */}
              <button
                onClick={() => router.push("/notifications")}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full p-0 text-[10px]"
                  >
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </Badge>
                )}
              </button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted focus:outline-none">
                    <Avatar className="h-7 w-7">
                      {user?.image && <AvatarImage src={user.image} alt={user.name || ""} />}
                      <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                        {getInitials(user?.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/bookmarks")}>
                    <Bookmark className="mr-2 h-4 w-4" />Bookmarks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/login")}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign in
              </button>
              <button
                onClick={() => router.push("/register")}
                className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Get started
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border transition-all duration-300 md:hidden",
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 border-none"
        )}
      >
        <div className="space-y-1 px-4 py-3">
          {/* Mobile search */}
          <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="mb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search articles…"
                className="w-full rounded-lg border border-border bg-muted/50 py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </form>

          <MobileLink href="/feed" icon={<Search className="h-4 w-4" />}>Explore</MobileLink>

          {isLoggedIn ? (
            <>
              <MobileLink href="/editor/new" icon={<PenSquare className="h-4 w-4" />}>Write new post</MobileLink>
              <MobileLink href="/notifications" icon={<Bell className="h-4 w-4" />}>
                Notifications
                {unreadNotifications > 0 && (
                  <Badge variant="destructive" className="ml-auto h-5 text-xs">{unreadNotifications}</Badge>
                )}
              </MobileLink>
              <div className="my-2 border-t border-border" />
              <MobileLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</MobileLink>
              <MobileLink href="/profile" icon={<User className="h-4 w-4" />}>Profile</MobileLink>
              <MobileLink href="/bookmarks" icon={<Bookmark className="h-4 w-4" />}>Bookmarks</MobileLink>
              <MobileLink href="/settings" icon={<Settings className="h-4 w-4" />}>Settings</MobileLink>
              <div className="my-2 border-t border-border" />
              <button
                onClick={() => { signOut({ callbackUrl: "/" }); setMobileMenuOpen(false); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => { router.push("/login"); setMobileMenuOpen(false); }}
                className="w-full rounded-lg border border-border py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Sign in
              </button>
              <button
                onClick={() => { router.push("/register"); setMobileMenuOpen(false); }}
                className="w-full rounded-lg bg-foreground py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Get started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </Link>
  );
}

export default Navbar;
