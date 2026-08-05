import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const alt = "Prompt preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Cached for a day.
 *
 * This is a separate HTTP request from the page itself, fired by every social
 * unfurler and crawler that sees the og:image tag — so uncached it silently
 * doubled the request count for every prompt. The card only changes when the
 * title, price or first example does, none of which need per-request freshness.
 */
export const revalidate = 86400;

/**
 * The share card for a prompt IS its example output.
 *
 * On a visual site that massively out-clicks a text card — someone deciding
 * whether to open the link wants to see what the prompt produces, not read
 * its title. Falls back to a typographic card when no example exists yet.
 */
export default async function Image({ params }: { params: { slug: string } }) {
  const prompt = await prisma.prompt.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    select: {
      title: true,
      priceCents: true,
      examples: { where: { isVideo: false }, orderBy: { order: "asc" }, take: 1 },
    },
  });

  const image = prompt?.examples[0]?.url;
  const title = prompt?.title ?? "Prompt";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FBFBF0",
          border: "16px solid #2C2E2A",
        }}
      >
        {image && (
          <div style={{ display: "flex", width: "50%", height: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" width={584} height={598} style={{ objectFit: "cover" }} />
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: image ? "50%" : "100%",
            padding: 56,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#2C2E2A" }}>Make</span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#2C2E2A",
                background: "#8ED462",
                border: "2px solid #2C2E2A",
                borderRadius: 4,
                padding: "1px 8px",
              }}
            >
              frame
            </span>
          </div>

          <div
            style={{
              fontSize: image ? 44 : 64,
              fontWeight: 700,
              color: "#2C2E2A",
              lineHeight: 1.15,
              letterSpacing: -1,
            }}
          >
            {title.length > 90 ? `${title.slice(0, 90)}…` : title}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 22,
              fontWeight: 700,
              color: "#2C2E2A",
              background: "#8ED462",
              border: "2px solid #2C2E2A",
              borderRadius: 4,
              padding: "6px 14px",
              alignSelf: "flex-start",
            }}
          >
            {prompt && prompt.priceCents > 0
              ? `$${(prompt.priceCents / 100).toFixed(2)}`
              : "Free prompt"}
          </div>
        </div>
      </div>
    ),
    size
  );
}
