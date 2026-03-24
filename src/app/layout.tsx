import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import AuthProvider from "@/components/shared/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
  metadataBase: new URL("https://inspire.blog"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://inspire.blog",
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
  url: "https://inspire.blog",
  description:
    "A modern publishing platform for curious minds. Discover and share articles on technology, programming, design, and more.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://inspire.blog/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "Inspire.blog",
    url: "https://inspire.blog",
    logo: {
      "@type": "ImageObject",
      url: "https://inspire.blog/logo.png",
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
      className={`${inter.variable} ${lora.variable}`}
      suppressHydrationWarning
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
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
