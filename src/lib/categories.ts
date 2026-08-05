

export type ChipColor = "coral" | "yellow" | "lilac" | "lime" | "green";

export interface ClusterDef {
  slug: string;
  name: string;
  /** Short tagline shown under the cluster name. */
  tagline: string;
  /** Intro paragraph for the pillar page (helps it rank). */
  description: string;
  /** Spot colour used for this cluster's chip. Token key, never a hex. */
  chip: ChipColor;
}

export const CLUSTERS: ClusterDef[] = [
  {
    slug: "ai-image-design",
    name: "AI Image & Design",
    tagline: "Thumbnails, posts & banners",
    description:
      "AI image generators for YouTube thumbnails, Instagram posts, banners, logos and product shots — with copy-paste prompts, worked examples, and honest notes on what each tool actually does well.",
    chip: "coral",
  },
  {
    slug: "ai-video-audio",
    name: "AI Video & Audio",
    tagline: "Reels, shorts & voiceovers",
    description:
      "Text-to-video, AI editing, voiceovers and music for creators — practical prompts and step-by-step guides for making reels and shorts that hold attention.",
    chip: "green",
  },
  {
    slug: "ai-writing",
    name: "AI Writing",
    tagline: "Captions, scripts & hooks",
    description:
      "AI writing tools for captions, video scripts, hooks and titles — prompts that produce copy worth publishing, plus comparisons of the tools behind them.",
    chip: "lilac",
  },
  {
    slug: "ai-productivity-coding",
    name: "AI Productivity",
    tagline: "Automate the boring parts",
    description:
      "AI assistants for planning, batching, automation and light coding — how to cut the repetitive work out of a content workflow so you can ship more.",
    chip: "yellow",
  },
  {
    slug: "ai-for-creators",
    name: "AI for Creators",
    tagline: "Brand kits & ad creative",
    description:
      "Putting it together: brand kits, content calendars, ad creative and repurposing workflows for creators, freelancers and small brands.",
    chip: "lime",
  },
];

export const CLUSTER_SLUGS = CLUSTERS.map((c) => c.slug);

export function getCluster(slug: string): ClusterDef | undefined {
  return CLUSTERS.find((c) => c.slug === slug);
}

/** Tailwind classes for a cluster chip. Fill + paired foreground, never spot-as-text. */
export const CHIP_CLASSES: Record<ChipColor, string> = {
  coral: "bg-chip-coral text-chip-coral-fg",
  yellow: "bg-chip-yellow text-chip-yellow-fg",
  lilac: "bg-chip-lilac text-chip-lilac-fg",
  lime: "bg-chip-lime text-chip-lime-fg",
  green: "bg-chip-green text-chip-green-fg",
};

export function chipClass(chip: ChipColor | string | null | undefined): string {
  return CHIP_CLASSES[(chip as ChipColor) ?? "lime"] ?? CHIP_CLASSES.lime;
}


