import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Site-level share card, in the brand's own palette.
 *
 * Uses system fonts rather than fetching Fraunces at render time: an OG route
 * that depends on a network fetch fails silently and ships a blank card,
 * which is worse than slightly different type.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#FBFBF0",
          padding: 80,
          border: "16px solid #2C2E2A",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: "#2C2E2A" }}>Make</span>
          <span
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#2C2E2A",
              background: "#8ED462",
              border: "3px solid #2C2E2A",
              borderRadius: 6,
              padding: "2px 12px",
            }}
          >
            frame
          </span>
        </div>

        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            color: "#2C2E2A",
            lineHeight: 1.1,
            letterSpacing: -1.5,
            maxWidth: 900,
          }}
        >
          AI prompts that show their output
        </div>

        <div style={{ fontSize: 30, color: "#6B6E64", marginTop: 28, maxWidth: 860 }}>
          Thumbnails, reels, posts and banners — with the model and settings behind each one.
        </div>
      </div>
    ),
    size
  );
}
