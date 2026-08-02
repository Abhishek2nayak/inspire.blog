/**
 * Content types are derived from Prisma include shapes in src/lib/queries.ts —
 * import them from there rather than redeclaring them here.
 */
export type {
  PromptCard,
  PromptDetail,
  ToolCard,
  ToolDetail,
  ArticleCardData,
  ArticleDetail,
  CommentWithAuthor,
} from "@/lib/queries";

export type SaveKindLower = "article" | "prompt" | "tool";

export type DashboardStats = {
  totalViews: number;
  totalCopies: number;
  totalComments: number;
  totalPublished: number;
};
