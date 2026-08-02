"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OUTPUT_TYPES, DIFFICULTIES } from "@/lib/prompts";

interface FilterOption {
  value: string;
  label: string;
}

/**
 * Filters live in the URL rather than component state, so a filtered view is
 * shareable, back-button-able and crawlable.
 *
 * Each pill is a real <Link> (works without JS, crawlers can follow it) but
 * clicks are intercepted and routed through useTransition. That is what makes
 * it feel instant: the pill flips to its selected state immediately while the
 * server round-trip happens in the background, instead of the whole page
 * sitting frozen until the response lands.
 */
export default function PromptFilterBar({
  models,
  categories,
  activeCount,
}: {
  models: FilterOption[];
  categories: FilterOption[];
  activeCount: number;
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

  const groups: { key: string; label: string; options: FilterOption[] }[] = [
    {
      key: "output",
      label: "Making",
      options: OUTPUT_TYPES.map((o) => ({ value: o.slug, label: o.short })),
    },
    { key: "model", label: "Model", options: models },
    { key: "category", label: "Topic", options: categories },
    {
      key: "difficulty",
      label: "Level",
      options: DIFFICULTIES.map((d) => ({ value: d.value, label: d.label })),
    },
    {
      key: "price",
      label: "Price",
      options: [
        { value: "free", label: "Free" },
        { value: "paid", label: "Paid" },
      ],
    },
  ];

  return (
    <div className={cn("space-y-3 transition-opacity", isPending && "opacity-70")}>
      {groups.map((g) => (
        <div key={g.key} className="flex flex-wrap items-center gap-1.5">
          <span className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {g.label}
          </span>
          {g.options.map((o) => {
            const active = params.get(g.key) === o.value;
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
                  active
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

      <div className="flex items-center gap-3 pt-1">
        <label
          htmlFor="sort"
          className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Sort
        </label>
        <select
          id="sort"
          defaultValue={params.get("sort") ?? "newest"}
          onChange={(e) => {
            const next = new URLSearchParams(params.toString());
            if (e.target.value === "newest") next.delete("sort");
            else next.set("sort", e.target.value);
            const qs = next.toString();
            go(qs ? `${pathname}?${qs}` : pathname);
          }}
          className="rounded-md border border-input bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most copied</option>
          <option value="bestselling">Best selling</option>
        </select>

        {isPending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating…
          </span>
        )}

        {activeCount > 0 && (
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
            Clear {activeCount} filter{activeCount > 1 ? "s" : ""}
          </Link>
        )}
      </div>
    </div>
  );
}
