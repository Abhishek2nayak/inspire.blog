import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export interface SponsorConfig {
  name: string;
  tagline: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  logoUrl?: string;
  accentColor?: string; // tailwind bg class e.g. "bg-violet-500"
}

// Default sponsor — replace with env/db driven data as needed
const DEFAULT_SPONSOR: SponsorConfig = {
  name: process.env.NEXT_PUBLIC_SPONSOR_NAME || "Sponsor",
  tagline: process.env.NEXT_PUBLIC_SPONSOR_TAGLINE || "Promoted",
  description:
    process.env.NEXT_PUBLIC_SPONSOR_DESCRIPTION ||
    "Want to reach thousands of developers and builders? Advertise on Inspire.blog.",
  ctaText: process.env.NEXT_PUBLIC_SPONSOR_CTA_TEXT || "Get in touch",
  ctaUrl: process.env.NEXT_PUBLIC_SPONSOR_CTA_URL || "/contact",
  logoUrl: process.env.NEXT_PUBLIC_SPONSOR_LOGO_URL,
  accentColor: process.env.NEXT_PUBLIC_SPONSOR_ACCENT || "bg-blue-500",
};

interface SponsorCardProps {
  sponsor?: SponsorConfig;
}

export default function SponsorCard({ sponsor = DEFAULT_SPONSOR }: SponsorCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Accent bar */}
      <div className={`h-1 w-full ${sponsor.accentColor}`} />

      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {sponsor.tagline}
          </span>
          {sponsor.logoUrl && (
            <div className="relative h-6 w-16 overflow-hidden rounded">
              <Image
                src={sponsor.logoUrl}
                alt={sponsor.name}
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* Name */}
        <p className="mb-2 text-sm font-semibold text-foreground">{sponsor.name}</p>

        {/* Description */}
        <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
          {sponsor.description}
        </p>

        {/* CTA */}
        <Link
          href={sponsor.ctaUrl}
          target={sponsor.ctaUrl.startsWith("http") ? "_blank" : undefined}
          rel={sponsor.ctaUrl.startsWith("http") ? "noopener noreferrer nofollow" : undefined}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          {sponsor.ctaText}
          {sponsor.ctaUrl.startsWith("http") && <ExternalLink className="h-3 w-3 opacity-60" />}
        </Link>
      </div>
    </div>
  );
}
