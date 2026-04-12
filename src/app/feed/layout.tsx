import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed — Explore Articles",
  description:
    "Discover the latest articles on technology, programming, design, and more. Follow your favorite authors and stay up to date.",
  openGraph: {
    title: "Feed — Explore Articles | Inspire.blog",
    description:
      "Discover the latest articles on technology, programming, design, and more.",
    type: "website",
  },
  alternates: {
    canonical: "/feed",
  },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
