import type { Metadata } from "next";
import { Inter, Lora, Playfair_Display } from "next/font/google";
import AuthProvider from "@/components/shared/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ConditionalShell from "@/components/layout/ConditionalShell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// ✅ FIXED: Updated to new domain
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://inspireblog.mythosh.com";

export const metadata: Metadata = {
  title: {
    default: "Inspire Blog — A Publishing Platform for Developers & Tech Writers",
    template: "%s | Inspire Blog",
  },
  description:
    "Inspire Blog is a free publishing platform for developers, designers, and tech writers. Discover articles on AI, programming, Next.js, web development, and more — or share your own ideas.",
  keywords: [
    "developer blog",
    "tech blog platform",
    "programming articles",
    "AI blog",
    "web development blog",
    "Next.js blog",
    "software engineering blog",
    "inspire blog",
    "free blogging platform",
    "tech writing platform",
    "JavaScript blog",
    "React articles",
    "Prisma tutorials",
    "Claude AI blog",
    "publishing platform for developers",
  ],
  authors: [{ name: "Inspire Blog", url: BASE_URL }],
  creator: "Inspire Blog",
  publisher: "Inspire Blog",

  // ✅ FIXED: Updated metadataBase to new domain
  metadataBase: new URL(BASE_URL),

  // ✅ Google verification
  verification: {
    google: "nxkzM0PDGBbgXmWRyanSikl_1qlUeK6JbI2eTOUgGfU",
  },

  alternates: {
    canonical: BASE_URL,
    types: {
      "application/rss+xml": `${BASE_URL}/feed.xml`,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Inspire Blog",
    title: "Inspire Blog — A Publishing Platform for Developers & Tech Writers",
    description:
      "A free publishing platform for developers and tech writers. Discover articles on AI, programming, Next.js, design, and more — or share your ideas with thousands of readers.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Inspire Blog — Where Ideas Ignite",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@inspireblog",
    creator: "@inspireblog",
    title: "Inspire Blog — A Publishing Platform for Developers & Tech Writers",
    description:
      "Discover and share articles on AI, programming, Next.js, and web development. Free to read, free to write.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        alt: "Inspire Blog — Where Ideas Ignite",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  manifest: "/site.webmanifest",
  category: "technology",

  // ✅ NEW: App links for better social sharing
  appLinks: {
    web: {
      url: BASE_URL,
      should_fallback: true,
    },
  },
};

// ✅ UPDATED: Richer structured data with Blog schema + Organization
const jsonLd = [
  // Schema 1: WebSite (enables Google Sitelinks search box)
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Inspire Blog",
    alternateName: "Inspire.blog",
    url: BASE_URL,
    description:
      "A free publishing platform for developers and tech writers. Discover articles on AI, programming, Next.js, web development, and design.",
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Inspire Blog",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://twitter.com/inspireblog",
        "https://dev.to/inspireblog",
      ],
    },
  },

  // Schema 2: Blog (tells Google this is a blog platform)
  {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Inspire Blog",
    url: BASE_URL,
    description:
      "A publishing platform for developers and tech writers covering AI, programming, Next.js, web development, design, and more.",
    inLanguage: "en-US",
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: "Inspire Blog",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    audience: {
      "@type": "Audience",
      audienceType: "Developers, Designers, Tech Writers",
    },
    about: [
      { "@type": "Thing", name: "Web Development" },
      { "@type": "Thing", name: "Artificial Intelligence" },
      { "@type": "Thing", name: "Programming" },
      { "@type": "Thing", name: "Next.js" },
      { "@type": "Thing", name: "JavaScript" },
    ],
  },

  // Schema 3: Organization (boosts brand authority in Google)
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Inspire Blog",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    description:
      "Inspire Blog is a free publishing platform where developers and tech writers share ideas on AI, programming, and design.",
    foundingDate: "2026",
    sameAs: [
      "https://twitter.com/inspireblog",
      "https://dev.to/inspireblog",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${BASE_URL}/contact`,
    },
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} ${playfair.variable}`}
    >
      <head>
        {/* ✅ All 3 JSON-LD schemas injected */}
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
