/**
 * The "what am I making" and "which model" axes.
 *
 * These are ORTHOGONAL to the topic clusters in ./categories.ts. A prompt has
 * one category (topic) and one output type (artifact), and they cross-cut:
 * "AI Image & Design" × "YouTube thumbnail" is a real page, and so is
 * "AI Image & Design" × "Instagram carousel".
 *
 * Output types are a closed set and map 1:1 to the Prisma `OutputType` enum.
 * AI models are deliberately NOT an enum — see prisma/schema.prisma.
 */
import type { ChipColor } from "./categories";

/* ─────────────────────────── output types ─────────────────────────── */

/** Mirrors the Prisma `OutputType` enum exactly. Keep both in sync. */
export type OutputTypeSlug =
  | "INSTAGRAM_POST"
  | "INSTAGRAM_CAROUSEL"
  | "INSTAGRAM_STORY"
  | "YOUTUBE_THUMBNAIL"
  | "REEL_SHORT"
  | "BANNER"
  | "POSTER"
  | "LOGO"
  | "PRODUCT_SHOT"
  | "AVATAR"
  | "AD_CREATIVE";

export interface OutputTypeDef {
  /** Prisma enum value. */
  value: OutputTypeSlug;
  /** URL segment for /prompts/for/[output]. */
  slug: string;
  name: string;
  /** Short label for chips and filter pills. */
  short: string;
  tagline: string;
  /** Intro paragraph for the pillar page (helps it rank). */
  description: string;
  /** Typical aspect ratio, shown as a hint. */
  ratio: string;
  chip: ChipColor;
}

export const OUTPUT_TYPES: OutputTypeDef[] = [
  {
    value: "YOUTUBE_THUMBNAIL",
    slug: "youtube-thumbnails",
    name: "YouTube thumbnails",
    short: "Thumbnails",
    tagline: "Frames that earn the click",
    description:
      "AI prompts for YouTube thumbnails — high-contrast faces, bold props, and readable-at-120px compositions. Each one comes with the example output it produced and notes on what to change for your niche.",
    ratio: "16:9",
    chip: "coral",
  },
  {
    value: "REEL_SHORT",
    slug: "reels-and-shorts",
    name: "Reels & Shorts",
    short: "Reels",
    tagline: "Vertical video that holds",
    description:
      "Text-to-video and AI editing prompts for Reels, Shorts and TikToks — hook shots, b-roll, transitions and loops, sized 9:16 and built to survive the first two seconds.",
    ratio: "9:16",
    chip: "green",
  },
  {
    value: "INSTAGRAM_POST",
    slug: "instagram-posts",
    name: "Instagram posts",
    short: "IG posts",
    tagline: "Single-frame scroll-stoppers",
    description:
      "AI image prompts for Instagram feed posts — quote cards, lifestyle scenes, flat lays and product moments that read well at thumbnail size in a crowded grid.",
    ratio: "4:5",
    chip: "lilac",
  },
  {
    value: "INSTAGRAM_CAROUSEL",
    slug: "instagram-carousels",
    name: "Instagram carousels",
    short: "Carousels",
    tagline: "Swipeable, consistent sets",
    description:
      "AI image prompts for multi-slide Instagram carousels where every frame shares a visual system — consistent palette, type and lighting across 5 to 10 slides.",
    ratio: "4:5",
    chip: "lilac",
  },
  {
    value: "INSTAGRAM_STORY",
    slug: "instagram-stories",
    name: "Instagram stories",
    short: "Stories",
    tagline: "Full-bleed vertical",
    description:
      "AI image prompts for Instagram stories — full-bleed 9:16 backgrounds and story frames with deliberate empty space for stickers, polls and captions.",
    ratio: "9:16",
    chip: "lilac",
  },
  {
    value: "BANNER",
    slug: "banners",
    name: "Banners & headers",
    short: "Banners",
    tagline: "Wide, and safe to crop",
    description:
      "AI prompts for YouTube channel art, X headers, LinkedIn banners and website heroes — wide compositions that survive aggressive centre-cropping across devices.",
    chip: "yellow",
    ratio: "16:9",
  },
  {
    value: "AD_CREATIVE",
    slug: "ad-creative",
    name: "Ad creative",
    short: "Ads",
    tagline: "Built to convert",
    description:
      "AI image prompts for paid-social creative — hero shots, before/after frames, UGC-style scenes and offer cards with room reserved for headline and CTA.",
    ratio: "1:1",
    chip: "coral",
  },
  {
    value: "PRODUCT_SHOT",
    slug: "product-shots",
    name: "Product shots",
    short: "Products",
    tagline: "Studio look, no studio",
    description:
      "AI product photography prompts — seamless backdrops, controlled reflections, lifestyle staging and packaging mockups without a lighting rig.",
    ratio: "1:1",
    chip: "green",
  },
  {
    value: "LOGO",
    slug: "logos-and-marks",
    name: "Logos & marks",
    short: "Logos",
    tagline: "Simple, scalable marks",
    description:
      "AI prompts for logo concepts, monograms and app icons that stay legible when scaled down — plus how to iterate a concept into something usable.",
    ratio: "1:1",
    chip: "yellow",
  },
  {
    value: "POSTER",
    slug: "posters",
    name: "Posters & flyers",
    short: "Posters",
    tagline: "Print-ready layouts",
    description:
      "AI image prompts for event posters, flyers and announcement graphics — with real typographic hierarchy and space reserved for the details that matter.",
    ratio: "2:3",
    chip: "lilac",
  },
  {
    value: "AVATAR",
    slug: "avatars-and-headshots",
    name: "Avatars & headshots",
    short: "Avatars",
    tagline: "Profile pictures that read",
    description:
      "AI headshot and avatar prompts for profile pictures — consistent lighting and framing that stay recognisable in a 40px circle.",
    ratio: "1:1",
    chip: "lime",
  },
];

export const OUTPUT_TYPE_SLUGS = OUTPUT_TYPES.map((o) => o.slug);

export function getOutputType(slug: string): OutputTypeDef | undefined {
  return OUTPUT_TYPES.find((o) => o.slug === slug);
}

export function getOutputTypeByValue(value: string): OutputTypeDef | undefined {
  return OUTPUT_TYPES.find((o) => o.value === value);
}

/** Enum values, for the AI writer's json_schema. */
export const OUTPUT_TYPE_VALUES = OUTPUT_TYPES.map((o) => o.value);

/* ─────────────────────────── AI models ─────────────────────────── */

/**
 * Seed data for the `AiModel` table. This is a TABLE not an enum precisely
 * because this list churns — new models ship monthly, and a launch is exactly
 * when you want to publish prompts fastest. Adding one here is a seed re-run,
 * not a schema migration.
 */
export interface AiModelDef {
  slug: string;
  name: string;
  vendor: string;
  kind: "IMAGE" | "VIDEO" | "TEXT";
  url: string;
  /** Pillar-page intro for /models/[slug]. */
  blurb: string;
}

export const AI_MODELS: AiModelDef[] = [
  {
    slug: "midjourney",
    name: "Midjourney",
    vendor: "Midjourney",
    kind: "IMAGE",
    url: "https://www.midjourney.com",
    blurb:
      "Midjourney is the default choice when the image needs to look styled rather than literal. It rewards short, confident prompts and parameter tuning over long descriptions.",
  },
  {
    slug: "nano-banana",
    name: "Nano Banana",
    vendor: "Google",
    kind: "IMAGE",
    url: "https://gemini.google.com",
    blurb:
      "Google's image model, strongest at editing an existing image and at holding a character or product consistent across a set — which makes it the practical pick for carousels and series.",
  },
  {
    slug: "chatgpt-image",
    name: "ChatGPT Image",
    vendor: "OpenAI",
    kind: "IMAGE",
    url: "https://chatgpt.com",
    blurb:
      "The most reliable model for images that contain readable text — titles, labels and packaging — and for iterating conversationally rather than re-prompting from scratch.",
  },
  {
    slug: "flux",
    name: "Flux",
    vendor: "Black Forest Labs",
    kind: "IMAGE",
    url: "https://blackforestlabs.ai",
    blurb:
      "Flux trades some of Midjourney's house style for prompt accuracy and photographic realism, and it runs in far more places — including locally.",
  },
  {
    slug: "sora",
    name: "Sora",
    vendor: "OpenAI",
    kind: "VIDEO",
    url: "https://openai.com/sora",
    blurb:
      "Sora handles longer shots with coherent motion and camera language. Prompts read like shot lists: subject, camera move, lighting, duration.",
  },
  {
    slug: "veo",
    name: "Veo",
    vendor: "Google",
    kind: "VIDEO",
    url: "https://deepmind.google/technologies/veo/",
    blurb:
      "Google's video model, notable for generating synchronised audio alongside the footage — which removes an entire step from short-form workflows.",
  },
  {
    slug: "kling",
    name: "Kling",
    vendor: "Kuaishou",
    kind: "VIDEO",
    url: "https://klingai.com",
    blurb:
      "Kling is the strongest of the accessible image-to-video models — feed it a still you already like and direct the motion from there.",
  },
  {
    slug: "runway",
    name: "Runway",
    vendor: "Runway",
    kind: "VIDEO",
    url: "https://runwayml.com",
    blurb:
      "Runway is a video editing suite with generation attached, so it fits creators who need to finish a cut rather than just produce clips.",
  },
];

export const AI_MODEL_SLUGS = AI_MODELS.map((m) => m.slug);

export function getAiModel(slug: string): AiModelDef | undefined {
  return AI_MODELS.find((m) => m.slug === slug);
}

/* ─────────────────────────── difficulty ─────────────────────────── */

export const DIFFICULTIES = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;
