import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/dashboard/CategoryManager";

export const dynamic = "force-dynamic";

export default async function DashboardCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { prompts: true, articles: true, tools: true } },
    },
  });

  return (
    <CategoryManager
      initial={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        tagline: c.tagline,
        description: c.description,
        chip: c.chip,
        order: c.order,
        counts: c._count,
      }))}
    />
  );
}
