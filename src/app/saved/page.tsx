import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { promptCardInclude, toolCardInclude, articleCardInclude } from "@/lib/queries";
import PromptCard from "@/components/prompt/PromptCard";
import ToolCard from "@/components/tool/ToolCard";
import ArticleCard from "@/components/article/ArticleCard";

export const metadata: Metadata = {
  title: "Saved",
  robots: { index: false },
};

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login?callbackUrl=/saved");

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { articleId: true, promptId: true, toolId: true },
  });

  const promptIds = bookmarks.map((b) => b.promptId).filter((v): v is string => !!v);
  const toolIds = bookmarks.map((b) => b.toolId).filter((v): v is string => !!v);
  const articleIds = bookmarks.map((b) => b.articleId).filter((v): v is string => !!v);

  const [prompts, tools, articles] = await Promise.all([
    promptIds.length
      ? prisma.prompt.findMany({ where: { id: { in: promptIds } }, include: promptCardInclude })
      : [],
    toolIds.length
      ? prisma.tool.findMany({ where: { id: { in: toolIds } }, include: toolCardInclude })
      : [],
    articleIds.length
      ? prisma.article.findMany({ where: { id: { in: articleIds } }, include: articleCardInclude })
      : [],
  ]);

  const total = prompts.length + tools.length + articles.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Saved</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {total} item{total === 1 ? "" : "s"}
      </p>

      {total === 0 && (
        <div className="mt-8 rounded-md border-2 border-dashed border-rule-strong p-12 text-center">
          <p className="font-display text-lg font-bold text-foreground">Nothing saved yet</p>
          <Link href="/prompts" className="mt-1 inline-block text-sm text-link hover:underline">
            Browse the prompt library
          </Link>
        </div>
      )}

      {prompts.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">Prompts</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))}
          </div>
        </section>
      )}

      {tools.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">Tools</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">Tutorials</h2>
          <div className="space-y-4">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
