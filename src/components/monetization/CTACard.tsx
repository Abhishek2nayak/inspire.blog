import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";

interface CTACardProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  external?: boolean;
  variant?: "default" | "highlight" | "subtle";
}

export function CTACard({
  title,
  description,
  buttonText,
  href,
  external = false,
  variant = "default",
}: CTACardProps) {
  const variantStyles = {
    default: "border-border bg-card",
    highlight: "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50",
    subtle: "border-border bg-muted/30",
  };

  const buttonStyles = {
    default: "bg-foreground text-background hover:opacity-90",
    highlight: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200",
    subtle: "bg-foreground text-background hover:opacity-90",
  };

  const content = (
    <>
      <h3 className="mb-1.5 text-sm font-bold text-foreground">{title}</h3>
      <p className="mb-4 text-xs text-muted-foreground leading-relaxed">{description}</p>
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${buttonStyles[variant]}`}
      >
        {buttonText}
        {external ? <ExternalLink className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
      </span>
    </>
  );

  const wrapperClass = `block rounded-2xl border p-5 ${variantStyles[variant]}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={wrapperClass}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={wrapperClass}>
      {content}
    </Link>
  );
}

interface AffiliateCardProps {
  name: string;
  description: string;
  badge?: string;
  href: string;
  logoUrl?: string;
  discount?: string;
}

export function AffiliateCard({ name, description, badge, href, logoUrl, discount }: AffiliateCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 transition-shadow hover:shadow-md"
    >
      {logoUrl && (
        <img src={logoUrl} alt={name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-sm font-bold text-foreground">{name}</span>
          {badge && (
            <span className="shrink-0 rounded-md bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
        {discount && (
          <p className="mt-1.5 text-xs font-semibold text-amber-700">{discount}</p>
        )}
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground mt-0.5" />
    </a>
  );
}

interface ToolCardProps {
  name: string;
  description: string;
  category: string;
  href: string;
  logoUrl?: string;
  free?: boolean;
}

export function ToolCard({ name, description, category, href, logoUrl, free }: ToolCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-blue-200 hover:shadow-sm"
    >
      {logoUrl ? (
        <img src={logoUrl} alt={name} className="h-9 w-9 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-sm font-bold">
          {name[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          {free && (
            <span className="rounded-md bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
              Free
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
        <span className="mt-1 inline-block text-[10px] font-medium text-blue-600">{category}</span>
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-blue-600 mt-0.5" />
    </a>
  );
}
