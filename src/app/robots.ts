import { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /go/ is the affiliate redirector — no reason to crawl or pass equity
        // through it. /saved is per-user. /api/ and the admin surfaces are private.
        disallow: ["/editor/", "/dashboard/", "/settings", "/api/", "/go/", "/saved"],
      },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
