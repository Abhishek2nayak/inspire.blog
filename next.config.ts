import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Scoped deliberately. A wildcard hostname turns the Next image optimizer
    // into an open proxy that anyone can point at any URL.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "http", hostname: "localhost" },
      
    ],
  },
  serverExternalPackages: ["@prisma/client", "cloudinary"],

  /**
   * Cap build parallelism.
   *
   * Static generation forks one worker per CPU (11 here), each opening its own
   * Prisma connection pool. Against a scale-to-zero Neon instance that
   * thundering herd exhausts the connection limit and prerendering fails with
   * "Can't reach database server" — intermittently, which is worse than
   * failing consistently. Two workers builds slightly slower and reliably.
   */
  experimental: {
    cpus: 2,
  },

  /**
   * Permanent redirects for URLs removed in the Makeframe rebuild, so the old
   * paths drain out of Google's index instead of returning 404s.
   */
  async redirects() {
    return [
      { source: "/feed", destination: "/", permanent: true },
      { source: "/series", destination: "/tutorials", permanent: true },
      { source: "/series/:slug", destination: "/tutorials", permanent: true },
      { source: "/authors", destination: "/about", permanent: true },
      { source: "/profile", destination: "/", permanent: true },
      { source: "/profile/:path*", destination: "/", permanent: true },
      { source: "/bookmarks", destination: "/saved", permanent: true },
      { source: "/notifications", destination: "/", permanent: true },
      { source: "/onboarding", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
