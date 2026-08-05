import { Prisma } from "@prisma/client";

/**
 * Shared Prisma include shapes.
 *
 * Every list/detail query pulls its `include` from here, and the exported
 * types are derived from those same objects via Prisma.GetPayload. That is
 * deliberate: the previous code hand-wrote a `PostWithAuthor` type that
 * declared `_count.reactions` the include never selected, so it was
 * `undefined` at runtime while typed `number`. Deriving the type from the
 * include makes that class of drift impossible.
 */

/**
 * Resolve an `include` as a single SQL statement (LATERAL JOIN) rather than
 * one round trip per relation edge.
 *
 * WHY: Prisma's default `relationLoadStrategy` is "query" — it issues a
 * separate statement per relation and stitches results in memory. Nothing in
 * the calling code hints at this, so `promptDetailInclude` reads as one query
 * and bills as eleven. That fan-out, not any N+1, was the dominant cost.
 *
 * Spread this into read queries that use an `include`:
 *     prisma.prompt.findMany({ ...JOIN, where, include: promptCardInclude })
 *
 * ESCAPE HATCH: `relationJoins` is a Preview feature in Prisma 5.22. If a
 * query ever returns a wrong shape, flip the value here to "query" to restore
 * the old behaviour everywhere at once — no call site changes needed.
 */
export const JOIN = { relationLoadStrategy: "join" } as const;

export const authorSelect = {
  id: true,
  name: true,
  image: true,
  bio: true,
} satisfies Prisma.UserSelect;

/* ─────────────────────────── prompts ─────────────────────────── */

export const promptCardInclude = {
  category: { select: { id: true, name: true, slug: true, chip: true } },
  model: { select: { id: true, name: true, slug: true, kind: true } },
  examples: { orderBy: { order: "asc" }, take: 1 },
  tags: { include: { tag: true } },
} satisfies Prisma.PromptInclude;

export const promptDetailInclude = {
  author: { select: authorSelect },
  category: { select: { id: true, name: true, slug: true, chip: true, tagline: true } },
  model: true,
  examples: { orderBy: { order: "asc" } },
  variations: { orderBy: { order: "asc" } },
  tags: { include: { tag: true } },
  tools: { include: { tool: { select: toolCardSelect() } } },
  _count: { select: { comments: true, bookmarks: true } },
} satisfies Prisma.PromptInclude;

export type PromptCard = Prisma.PromptGetPayload<{ include: typeof promptCardInclude }>;
export type PromptDetail = Prisma.PromptGetPayload<{ include: typeof promptDetailInclude }>;

/* ─────────────────────────── tools ─────────────────────────── */

function toolCardSelect() {
  return {
    id: true,
    name: true,
    slug: true,
    tagline: true,
    logo: true,
    pricing: true,
    priceNote: true,
    rating: true,
    officialUrl: true,
    affiliateUrl: true,
  } satisfies Prisma.ToolSelect;
}

export const toolCardInclude = {
  category: { select: { id: true, name: true, slug: true, chip: true } },
  tags: { include: { tag: true } },
} satisfies Prisma.ToolInclude;

export const toolDetailInclude = {
  category: { select: { id: true, name: true, slug: true, chip: true } },
  tags: { include: { tag: true } },
  prompts: { include: { prompt: { include: promptCardInclude } } },
  articles: {
    include: {
      article: {
        select: { id: true, title: true, slug: true, excerpt: true, readTime: true, kind: true },
      },
    },
    orderBy: { order: "asc" },
  },
} satisfies Prisma.ToolInclude;

export type ToolCard = Prisma.ToolGetPayload<{ include: typeof toolCardInclude }>;
export type ToolDetail = Prisma.ToolGetPayload<{ include: typeof toolDetailInclude }>;

/* ─────────────────────────── articles ─────────────────────────── */

export const articleCardInclude = {
  author: { select: authorSelect },
  category: { select: { id: true, name: true, slug: true, chip: true } },
  tags: { include: { tag: true } },
  _count: { select: { comments: true, bookmarks: true } },
} satisfies Prisma.ArticleInclude;

export const articleDetailInclude = {
  author: { select: authorSelect },
  category: { select: { id: true, name: true, slug: true, chip: true, tagline: true } },
  tags: { include: { tag: true } },
  steps: { orderBy: { order: "asc" } },
  prompts: {
    include: { prompt: { include: promptCardInclude } },
    orderBy: { order: "asc" },
  },
  tools: {
    include: { tool: { include: toolCardInclude } },
    orderBy: { order: "asc" },
  },
  _count: { select: { comments: true, bookmarks: true } },
} satisfies Prisma.ArticleInclude;

export type ArticleCardData = Prisma.ArticleGetPayload<{ include: typeof articleCardInclude }>;
export type ArticleDetail = Prisma.ArticleGetPayload<{ include: typeof articleDetailInclude }>;

/* ─────────────────────────── comments ─────────────────────────── */

export const commentInclude = {
  author: { select: { id: true, name: true, image: true } },
  replies: {
    where: { hidden: false },
    include: { author: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.CommentInclude;

type CommentRow = Prisma.CommentGetPayload<{
  include: { author: { select: { id: true; name: true; image: true } } };
}>;

/**
 * Threads are one level deep: a top-level comment carries `replies`, and the
 * replies themselves do not. Marking it optional models that accurately —
 * declaring it required made the recursive render call a type error.
 */
export type CommentWithAuthor = CommentRow & { replies?: CommentRow[] };

/** Only published content is ever visible to readers. */
export const PUBLISHED = { status: "PUBLISHED" } as const;
