import { cache } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { articleDetailInclude, articleCardInclude, PUBLISHED } from "@/lib/queries";
import { siteConfig, absoluteUrl } from "@/lib/site-config";
import { stripHtml } from "@/lib/sanitize";
import { formatDate } from "@/lib/utils";
import ArticleContent from "@/components/article/ArticleContent";
import StepRenderer from "@/components/article/StepRenderer";
import ReadingProgressBar from "@/components/article/ReadingProgressBar";
import SocialShare from "@/components/article/SocialShare";
import CommentSection from "@/components/article/CommentSection";
import PromptCard from "@/components/prompt/PromptCard";
import ToolCard from "@/components/tool/ToolCard";
import ArticleCard from "@/components/article/ArticleCard";
import AffiliateDisclosure from "@/components/tool/AffiliateDisclosure";
import { CategoryChip, DifficultyBadge } from "@/components/prompt/Badges";

const getArticle = cache(async (slug: string) => {
  return prisma.article.findFirst({
    where: { slug, ...PUBLISHED },
    include: articleDetailInclude,
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article not found" };

  const url = absoluteUrl(`/article/${article.slug}`);
  const description = (
    article.metaDesc ||
    article.excerpt ||
    stripHtml(article.content)
  ).slice(0, 155);

  return {
    title: article.metaTitle || article.title,
    description,
    alternates: { canonical: article.canonical || url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      ...(article.coverImage ? { images: [{ url: article.coverImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  // Not awaited: a view counter must never delay the response, and a failed
  // increment is not worth surfacing.
  prisma.article
    .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const comments = await prisma.comment.findMany({
    where: { articleId: article.id, hidden: false, parentId: null },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        where: { hidden: false },
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const related = await prisma.article.findMany({
    where: {
      ...PUBLISHED,
      id: { not: article.id },
      ...(article.categoryId ? { categoryId: article.categoryId } : {}),
    },
    include: articleCardInclude,
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const url = absoluteUrl(`/article/${article.slug}`);
  const description = (article.excerpt || stripHtml(article.content)).slice(0, 200);

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description,
      url,
      inLanguage: siteConfig.lang,
      datePublished: article.publishedAt?.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      ...(article.coverImage ? { image: article.coverImage } : {}),
      author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
      publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      keywords: article.tags.map((t) => t.tag.name).join(", "),
    },
  ];

  // HowTo only when there are real steps to describe.
  if (article.steps.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: article.title,
      description,
      ...(article.coverImage ? { image: article.coverImage } : {}),
      step: article.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: stripHtml(s.body),
        ...(s.image ? { image: s.image } : {}),
      })),
    });
  }

  jsonLd.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Tutorials", item: absoluteUrl("/tutorials") },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgressBar />

      <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <Link href="/tutorials" className="hover:text-foreground hover:underline">
            Tutorials
          </Link>
          {article.category && (
            <>
              <span className="mx-1.5">/</span>
              <Link
                href={`/category/${article.category.slug}`}
                className="hover:text-foreground hover:underline"
              >
                {article.category.name}
              </Link>
            </>
          )}
        </nav>

        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {article.category && (
              <CategoryChip name={article.category.name} chip={article.category.chip} />
            )}
            <DifficultyBadge value={article.difficulty} />
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              {article.subtitle}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime} min read
            </span>
          </div>
        </header>

        {article.coverImage && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-md border-2 border-ink">
            <Image
              src={article.coverImage}
              alt={article.coverAlt || ""}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              className="object-cover"
            />
          </div>
        )}

        {article.tools.length > 0 && <AffiliateDisclosure className="mb-6" />}

        <ArticleContent content={article.content} />

        {article.steps.length > 0 && (
          <section className="mt-10">
            <StepRenderer steps={article.steps} />
          </section>
        )}

        {article.prompts.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">
              Prompts used here
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {article.prompts.map(({ prompt, note }) => (
                <div key={prompt.id}>
                  <PromptCard prompt={prompt} />
                  {note && <p className="mt-1.5 text-xs text-muted-foreground">{note}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {article.tools.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">
              Tools mentioned
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {article.tools.map(({ tool }) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {article.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-1.5">
            {article.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-ink hover:text-foreground"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-border pt-6">
          <SocialShare url={url} title={article.title} />
        </div>

        <CommentSection articleId={article.id} initialComments={comments} />

        {related.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">Read next</h2>
            <div className="space-y-4">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
