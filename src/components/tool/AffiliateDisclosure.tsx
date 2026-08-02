import { cn } from "@/lib/utils";

/**
 * The FTC requires disclosure ABOVE the first affiliate link — a footer
 * mention does not satisfy it. Render this at the top of /tools, every tool
 * page, and any article carrying tool links.
 */
export default function AffiliateDisclosure({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-md border-l-4 border-ink bg-paper-warm px-4 py-2.5 text-xs leading-relaxed text-muted-foreground",
        className
      )}
    >
      <strong className="font-semibold text-foreground">Heads up:</strong> some links on this
      page are affiliate links. If you sign up through one, we may earn a commission at no extra
      cost to you. It never affects which tools we recommend or what we say about them.
    </p>
  );
}
