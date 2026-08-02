"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Opt {
  value: string;
  label: string;
}

/**
 * Same pattern as PromptFilterBar: real links for crawlers and no-JS, but
 * clicks go through useTransition so the pill responds immediately instead of
 * the page freezing until the server replies.
 */
export default function ToolFilterPills({
  pricing,
  categories,
  className,
}: {
  pricing: Opt[];
  categories: Opt[];
  className?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function hrefFor(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (next.get(key) === value) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function go(href: string) {
    startTransition(() => router.push(href, { scroll: false }));
  }

  const groups = [
    { key: "pricing", label: "Pricing", options: pricing },
    { key: "category", label: "Topic", options: categories },
  ];

  const active = groups.filter((g) => params.get(g.key)).length;

  return (
    <div className={cn("space-y-2 transition-opacity", isPending && "opacity-70", className)}>
      {groups.map((g) => (
        <div key={g.key} className="flex flex-wrap items-center gap-1.5">
          <span className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {g.label}
          </span>
          {g.options.map((o) => {
            const isActive = params.get(g.key) === o.value;
            const href = hrefFor(g.key, o.value);
            return (
              <Link
                key={o.value}
                href={href}
                scroll={false}
                onClick={(e) => {
                  e.preventDefault();
                  go(href);
                }}
                className={cn(
                  "rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "border-ink bg-ink text-bone"
                    : "border-border bg-card text-muted-foreground hover:border-ink hover:text-foreground"
                )}
              >
                {o.label}
              </Link>
            );
          })}
        </div>
      ))}

      {(isPending || active > 0) && (
        <div className="flex items-center gap-3 pt-1">
          {isPending && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Updating…
            </span>
          )}
          {active > 0 && (
            <Link
              href={pathname}
              scroll={false}
              onClick={(e) => {
                e.preventDefault();
                go(pathname);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-link hover:underline"
            >
              <X className="h-3 w-3" />
              Clear filters
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
