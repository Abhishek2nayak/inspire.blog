/**
 * Single source of truth for brand strings, URLs and social handles.
 *
 * Nothing else in the app should hardcode the site name, domain or tagline —
 * import from here so a rename is a one-file change.
 */
export const siteConfig = {
  name: "Makeframe",
  tagline: "AI prompts and tools for creators",
  description:
    "Copy-paste AI prompts for Instagram posts, YouTube thumbnails, reels and banners — plus honest reviews of the tools that make them.",

  /** Public origin, no trailing slash. */
  url: (process.env.NEXT_PUBLIC_APP_URL || "https://inspireblog.mythosh.com").replace(/\/$/, ""),

  locale: "en_US",
  lang: "en-US",

  /**
   * Social handles. Empty strings mean "no account yet" — the footer and
   * JSON-LD both skip empty entries rather than linking somewhere broken.
   */
  social: {
    x: "",
    instagram: "",
    youtube: "",
  },

  /**
   * JSON-LD `sameAs`. Deliberately EMPTY until the accounts actually exist —
   * fabricated sameAs entries hurt entity resolution rather than helping it.
   */
  socialUrls: [] as string[],

  /**
   * Paid listings are hidden until checkout actually works. Without this a
   * seller could price a prompt that no one can buy — the purchase endpoint
   * returns 501 — which is a dead end for both sides. Flip to "true" once
   * Stripe is wired.
   */
  paidPromptsEnabled: process.env.NEXT_PUBLIC_PAID_PROMPTS === "true",

  contactPath: "/contact",
  googleSiteVerification: "nxkzM0PDGBbgXmWRyanSikl_1qlUeK6JbI2eTOUgGfU",
  foundingYear: "2026",

  keywords: [
    "AI prompts",
    "Midjourney prompts",
    "Sora prompts",
    "YouTube thumbnail prompts",
    "Instagram post ideas AI",
    "AI reel prompts",
    "AI banner generator",
    "AI image prompts",
    "AI video prompts",
    "AI tools for creators",
    "AI content creation",
    "prompt library",
  ],
} as const;

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}

/** Social handles that are actually populated, as `{ key, handle, url }`. */
export function activeSocials() {
  const base: Record<keyof typeof siteConfig.social, string> = {
    x: "https://x.com/",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/@",
  };
  return (Object.keys(siteConfig.social) as (keyof typeof siteConfig.social)[])
    .filter((k) => siteConfig.social[k].length > 0)
    .map((k) => {
      const handle = siteConfig.social[k].replace(/^@/, "");
      return { key: k, handle, url: `${base[k]}${handle}` };
    });
}
