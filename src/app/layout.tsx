import type { Metadata } from "next";
import { Inter, Lora, Playfair_Display } from "next/font/google";
import AuthProvider from "@/components/shared/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://inspire-blog-five.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Inspire.blog — Where Ideas Ignite",
    template: "%s | Inspire.blog",
  },
  description:
    "Inspire.blog is a modern publishing platform for curious minds. Read insightful articles on technology, programming, design, and more — or share your own ideas with the world.",
  keywords: [
    "blog",
    "writing",
    "tech articles",
    "programming blog",
    "developer blog",
    "inspire blog",
    "web development",
    "software engineering",
    "design",
    "tutorials",
    "community",
    "publishing platform",
  ],
  authors: [{ name: "Inspire.blog" }],
  creator: "Inspire.blog",
  publisher: "Inspire.blog",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://inspire-blog-five.vercel.app"),
  verification: {
    google: "Umkl9-__RukhF2xFLAzwjvx9QtQwqN_IgabCv7leFBQ",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Inspire.blog",
    title: "Inspire.blog — Where Ideas Ignite",
    description:
      "A modern publishing platform for curious minds. Discover and share articles on technology, programming, design, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Inspire.blog — Where Ideas Ignite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inspire.blog — Where Ideas Ignite",
    description:
      "Discover and share insightful articles on technology, programming, and design.",
    images: ["/og-image.png"],
    creator: "@inspireblog",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/site.webmanifest",
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Inspire.blog",
  url: BASE_URL,
  description:
    "A modern publishing platform for curious minds. Discover and share articles on technology, programming, design, and more.",
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
    name: "Inspire.blog",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/logo.png`,
    },
  },
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
