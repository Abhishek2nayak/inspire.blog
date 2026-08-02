import { prisma } from "@/lib/prisma";
import PromptForm, { type PromptFormValues } from "@/components/dashboard/PromptForm";

export const dynamic = "force-dynamic";

const EMPTY: PromptFormValues = {
  title: "",
  slug: "",
  body: "",
  negative: "",
  description: "",
  tips: "",
  kind: "IMAGE",
  outputType: "YOUTUBE_THUMBNAIL",
  difficulty: "BEGINNER",
  aspectRatio: "",
  parameters: "",
  modelSlug: "",
  categorySlug: "",
  tags: "",
  status: "DRAFT",
  featured: false,
};

export default async function NewPromptPage() {
  const [models, categories] = await Promise.all([
    prisma.aiModel.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
  ]);

  return <PromptForm initial={EMPTY} models={models} categories={categories} />;
}
