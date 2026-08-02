import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PromptForm, { type PromptFormValues } from "@/components/dashboard/PromptForm";

export const dynamic = "force-dynamic";

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [prompt, models, categories] = await Promise.all([
    prisma.prompt.findUnique({
      where: { id },
      include: {
        model: { select: { slug: true } },
        category: { select: { slug: true } },
        tags: { include: { tag: true } },
        examples: { orderBy: { order: "asc" } },
      },
    }),
    prisma.aiModel.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
  ]);

  if (!prompt) notFound();

  const initial: PromptFormValues = {
    id: prompt.id,
    title: prompt.title,
    slug: prompt.slug,
    body: prompt.body,
    negative: prompt.negative ?? "",
    description: prompt.description ?? "",
    tips: prompt.tips ?? "",
    kind: prompt.kind,
    outputType: prompt.outputType,
    difficulty: prompt.difficulty,
    aspectRatio: prompt.aspectRatio ?? "",
    parameters: prompt.parameters ?? "",
    modelSlug: prompt.model?.slug ?? "",
    categorySlug: prompt.category?.slug ?? "",
    tags: prompt.tags.map((t) => t.tag.name).join(", "),
    status: prompt.status,
    featured: prompt.featured,
  };

  return (
    <PromptForm
      initial={initial}
      models={models}
      categories={categories}
      examples={prompt.examples.map((e) => ({
        id: e.id,
        url: e.url,
        alt: e.alt,
        isVideo: e.isVideo,
      }))}
    />
  );
}
