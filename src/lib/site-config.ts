/**
 * brand configuration for Makeframe. This is the single source of truth for the
 * site's name, tagline, social handles, and other brand-related metadata.
 */
export const siteConfig = {
  name: "Makeframe",
  tagline: "AI prompts and tools for creators",
  description:
    "Copy-paste AI prompts for Instagram posts, YouTube thumbnails, reels and banners — plus honest reviews of the tools that make them.",


  url: (process.env.NEXT_PUBLIC_APP_URL || "https://makeframe.online").replace(/\/$/, ""),

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

  /**
   * Contact addresses shown on /contact, /terms and /privacy.
   *
   * Still on the pre-rebrand domain deliberately — these mailboxes may be
   * live, and pointing legal/privacy mail at an address that doesn't exist
   * yet would silently lose messages. Change them here once the
   * makeframe.online mailboxes are set up; it's a one-file edit.
   */
  emails: {
    general: "hello@makeframe.online",
    legal: "legal@makeframe.online",
    privacy: "privacy@makeframe.online",
  },
  /**
   * Search Console verification token. Tokens are issued PER PROPERTY, so the
   * one from the pre-rebrand domain does not verify this one — get a fresh
   * token from Search Console for makeframe.online and set it in the env.
   * Empty means no meta tag is emitted at all, which is better than a stale
   * token that silently never verifies.
   */
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
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
