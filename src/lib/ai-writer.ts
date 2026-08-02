import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic } from "./anthropic";
import { CLUSTER_SLUGS } from "./categories";

export interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  metaTitle: string;
  metaDesc: string;
  tags: string[];
  category: string;
  contentHtml: string;
}

/**
 * JSON schema the model is constrained to (structured outputs).
 * Note: structured outputs do not support min/maxLength or numeric bounds —
 * we ask for limits in the prompt instead and rely on the schema for shape.
 */
const ARTICLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: {
      type: "string",
      description: "Compelling, specific article title. No site name, no quotes.",
    },
    slug: {
      type: "string",
      description: "URL slug: lowercase words separated by hyphens, no punctuation.",
    },
    excerpt: {
      type: "string",
      description: "One- or two-sentence summary of the article, around 150 characters.",
    },
    metaTitle: {
      type: "string",
      description: "SEO title tag, ideally under 60 characters, includes the main keyword.",
    },
    metaDesc: {
      type: "string",
      description: "SEO meta description, ideally under 155 characters, enticing and keyword-rich.",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "3 to 6 short topic tags, e.g. 'AI Writing', 'Productivity'.",
    },
    category: {
      type: "string",
      enum: [...CLUSTER_SLUGS],
      description:
        "The single best-fitting site cluster (topic) slug for this article.",
    },
    contentHtml: {
      type: "string",
      description:
        "The full article body as clean semantic HTML (no <html>/<body>/<h1> wrapper).",
    },
  },
  required: [
    "title",
    "slug",
    "excerpt",
    "metaTitle",
    "metaDesc",
    "tags",
    "category",
    "contentHtml",
  ],
} as const;

const SYSTEM = `You are a senior SEO content writer for "Makeframe", a website in the AI tools & software niche (reviews, comparisons, "best of" guides, and how-tos for everyday readers).

Write content that is genuinely helpful, original, and worth reading — the kind that earns Google rankings and passes AdSense review. Never produce thin or filler content.

HTML rules for the "contentHtml" field:
- Use only these tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <a>, <table>, <thead>, <tbody>, <tr>, <th>, <td>.
- Do NOT include an <h1> (the title is rendered separately) and do NOT wrap in <html>/<body>.
- Use <h2> for main sections and <h3> for sub-points. Use lists and a comparison <table> where they genuinely help.

Structure:
- Open with 2-3 sentences that hook the reader and state what they'll learn. Do not start with "In this article" or "In today's world".
- Cover the topic in clear sections with descriptive <h2> headings.
- For "best of"/listicle topics, give each option its own <h3> with what it's good for, plus brief pros/cons.
- For comparison topics, include a comparison <table> and a clear verdict.
- End with a short FAQ: an <h2>FAQ</h2> followed by 3-4 <h3> questions each answered in a <p>.
- Finish with a brief conclusion that helps the reader decide their next step.

Quality & accuracy:
- Aim for roughly 1,200-1,700 words of substance.
- Mention real, well-known tool names in <strong> where relevant, but do NOT invent exact prices, version numbers, benchmark figures, dates, or quotes. If pricing matters, speak generally (e.g. "offers a free tier and paid plans").
- Do NOT insert affiliate links or fabricated URLs — links are added later.
- Write naturally and avoid AI clichés ("In the ever-evolving landscape", "game-changer", "delve", "in conclusion").

Set "category" to the single cluster slug that best fits the article.

Return ONLY the structured JSON object — nothing else.`;

/**
 * Generate a complete, publish-ready article draft for a topic using Claude.
 */
export async function generateArticle(topic: string): Promise<GeneratedArticle> {
  const client = getAnthropic();

  const params = {
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Write a complete, publish-ready article for this topic: "${topic}".`,
      },
    ],
    output_config: {
      effort: "medium",
      format: {
        type: "json_schema",
        name: "article",
        schema: ARTICLE_SCHEMA,
      },
    },
  };

  // Cast through unknown so this compiles regardless of the installed SDK's
  // typing for `output_config` (structured outputs is current on Opus 4.8).
  const response = await client.messages.create(
    params as unknown as Anthropic.MessageCreateParamsNonStreaming
  );

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!textBlock) {
    throw new Error("The model returned no text content. Try again.");
  }

  let raw = textBlock.text.trim();
  // Structured outputs return pure JSON, but strip stray code fences defensively.
  if (raw.startsWith("```")) {
    raw = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
  }

  let data: GeneratedArticle;
  try {
    data = JSON.parse(raw) as GeneratedArticle;
  } catch {
    throw new Error("Could not parse the model response as JSON.");
  }

  if (!data.title || !data.contentHtml) {
    throw new Error("The generated article was missing a title or body.");
  }
  data.tags = Array.isArray(data.tags) ? data.tags.filter(Boolean) : [];
  return data;
}
