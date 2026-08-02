import React from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { siteConfig, activeSocials } from "@/lib/site-config";
import { OUTPUT_TYPES } from "@/lib/prompts";
import { CLUSTERS } from "@/lib/categories";

const FOOTER_LINKS = {
  explore: [
    { label: "Prompts", href: "/prompts" },
    { label: "Tools", href: "/tools" },
    { label: "Tutorials", href: "/tutorials" },
    { label: "Topics", href: "/categories" },
    { label: "Tags", href: "/tags" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

const Footer: React.FC = () => {
  // Only render social links that actually exist — the previous footer linked
  // to twitter.com/github.com homepages, which is worse than no link at all.
  const socials = activeSocials();

  return (
    <footer className="border-t-2 border-ink bg-paper-warm">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo size="sm" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
              Explore
            </h2>
            <ul className="space-y-2">
              {FOOTER_LINKS.explore.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
              Popular
            </h2>
            <ul className="space-y-2">
              {OUTPUT_TYPES.slice(0, 5).map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/prompts/for/${o.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
              Company
            </h2>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-t border-rule-strong pt-6">
          {CLUSTERS.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="rounded-sm border border-rule-strong px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-ink hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-rule-strong pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>

          {socials.length > 0 && (
            <ul className="flex items-center gap-3">
              {socials.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s.key === "x" ? "X" : s.key.charAt(0).toUpperCase() + s.key.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
