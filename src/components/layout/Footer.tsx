import React from "react";
import Link from "next/link";
import { Feather, Twitter, Github, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const FOOTER_LINKS = {
  discover: [
    { label: "Home", href: "/" },
    { label: "Feed", href: "/feed" },
    { label: "Search", href: "/search" },
    { label: "Tags", href: "/tags" },
    { label: "Series", href: "/series" },
  ],
  write: [
    { label: "New Post", href: "/editor/new" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Editor Guide", href: "/editor-guide" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Contact", href: "/contact" },
  ],
};

const SOCIAL_LINKS = [
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: Twitter,
  },
  {
    label: "GitHub",
    href: "https://github.com",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: Linkedin,
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-bold text-foreground hover:opacity-80 transition-opacity"
            >
              <Feather className="h-5 w-5" />
              Blogosphere
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Where ideas come to life. Discover stories, insights, and
              perspectives from writers around the world.
            </p>
            {/* Social icons */}
            <div className="mt-5 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <span>
                      <Icon className="h-4 w-4" />
                    </span>
                  </Button>
                </a>
              ))}
            </div>
          </div>

          {/* Discover */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Discover
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.discover.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Write */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Write
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.write.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Company
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Blogosphere. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with care by the Blogosphere team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
