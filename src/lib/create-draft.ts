import { prisma } from "./prisma";
import { generateSlug, calculateReadTime, getExcerpt } from "./utils";
import { sanitizeHtml } from "./sanitize";
import { upsertTags } from "./tags";
import type { GeneratedArticle } from "./ai-writer";

/**
 * Persist a generated article as an UNPUBLISHED draft (status: DRAFT).
 * The admin reviews and publishes it from /editor/[id].
 *
 * Content is sanitized here, on write, so unsafe HTML never reaches the DB —
 * the model produces this markup, so it is untrusted input like any other.
 */
export async function createDraftFromArticle(
  article: GeneratedArticle,
  authorId: string
) {
  let slug = generateSlug(article.slug || article.title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const content = sanitizeHtml(article.contentHtml);
  const readTime = calculateReadTime(content);
  const excerpt = article.excerpt?.trim() || getExcerpt(content);

  const tagIds = await upsertTags(article.tags || []);

  let categoryId: string | null = null;
  if (article.category) {
    const category = await prisma.category.findUnique({
      where: { slug: article.category },
    });
    categoryId = category?.id ?? null;
  }

  return prisma.article.create({
    data: {
      title: article.title,
      slug,
      content,
      excerpt,
      status: "DRAFT",
      metaTitle: article.metaTitle,
      metaDesc: article.metaDesc,
      readTime,
      authorId,
      categoryId,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });
}
