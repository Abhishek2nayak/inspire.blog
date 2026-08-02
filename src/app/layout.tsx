import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import AuthProvider from "@/components/shared/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ConditionalShell from "@/components/layout/ConditionalShell";
import { siteConfig, absoluteUrl } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Display face. Fraunces is a variable "soft/wonky" serif built for headlines —
 * warm enough to sit on bone paper, and heavy enough not to disappear beside a
 * 2px ink border (which is why it replaced Playfair, a hairline Didone).
 * Non-weight axes must be listed explicitly.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const title = `${siteConfig.name} — ${siteConfig.tagline}`;

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,

  // Omit the block entirely when unset — an empty content="" meta tag is
  // worse than none.
  ...(siteConfig.googleSiteVerification
    ? { verification: { google: siteConfig.googleSiteVerification } }
    : {}),

  alternates: {
    canonical: siteConfig.url,
    types: {
      "application/rss+xml": absoluteUrl("/feed.xml"),
    },
  },

  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
  },

  twitter: {
    card: "summary_large_image",
    title,
    description: siteConfig.description,
    ...(siteConfig.social.x
      ? { site: siteConfig.social.x, creator: siteConfig.social.x }
      : {}),
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  manifest: "/site.webmanifest",
  category: "technology",
};

/**
 * Site-level structured data.
 *
 * `sameAs` is deliberately omitted while siteConfig.socialUrls is empty —
 * pointing it at accounts that don't exist hurts entity resolution.
 * Per-page schema (Article/HowTo, CreativeWork, SoftwareApplication) is
 * emitted by the individual routes.
 */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.lang,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/search?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    foundingDate: siteConfig.foundingYear,
    ...(siteConfig.socialUrls.length > 0 ? { sameAs: siteConfig.socialUrls } : {}),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: absoluteUrl(siteConfig.contactPath),
    },
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        {jsonLd.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <AuthProvider>
          <TooltipProvider delayDuration={300}>
            <ConditionalShell>{children}</ConditionalShell>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
