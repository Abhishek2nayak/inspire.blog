/**
 * Makeframe seed. Idempotent — safe to run repeatedly.
 *
 * Upserts by slug throughout, so re-running updates content in place rather
 * than duplicating it. Users are never deleted here; see prisma/reset.ts.
 */
import { PrismaClient } from "@prisma/client";
import { CLUSTERS } from "../src/lib/categories";
import { AI_MODELS } from "../src/lib/prompts";
import { PROMPTS, TOOLS, ARTICLES } from "./seed-data";
import { sanitizeHtml, stripHtml } from "../src/lib/sanitize";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readTimeOf(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Upsert tags by slug and return their ids. */
async function upsertTags(names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    ids.push(tag.id);
  }
  return ids;
}

async function main() {
  // ── Admins ───────────────────────────────────────────────────────────
  // The seed is what grants admin, so it fails loudly rather than silently
  // producing a site nobody can administer.
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) {
    throw new Error(
      "ADMIN_EMAILS is empty. Set it in .env before seeding — otherwise no user " +
        "can reach the dashboard and all seeded content would be authorless."
    );
  }

  const admins = [];
  for (const email of adminEmails) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN" },
      create: { email, name: email.split("@")[0], role: "ADMIN" },
      include: { accounts: { select: { id: true } } },
    });
    admins.push(user);

    // An admin row with neither a password nor a linked OAuth account cannot
    // sign in at all. The seed creates users from ADMIN_EMAILS without
    // passwords by design (it must never invent credentials), so say so
    // loudly rather than leaving a dead admin account behind.
    const canSignIn = Boolean(user.password) || user.accounts.length > 0;
    console.log(
      `  admin: ${user.email}${canSignIn ? "" : "  <-- NO PASSWORD, cannot sign in"}`
    );
  }

  if (!admins.some((u) => u.password || u.accounts.length > 0)) {
    console.warn(
      "\n  WARNING: none of your admin accounts can actually sign in.\n" +
        "  Register through /register, then run:  npm run set-admin -- <email>\n"
    );
  }

  // Author seeded content with an admin that can actually log in to edit it.
  const author = admins.find((u) => u.password || u.accounts.length > 0) ?? admins[0];

  // ── Categories ───────────────────────────────────────────────────────
  for (const [i, c] of CLUSTERS.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        tagline: c.tagline,
        description: c.description,
        chip: c.chip,
        order: i,
      },
      create: {
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        description: c.description,
        chip: c.chip,
        order: i,
      },
    });
  }
  // Drop clusters no longer present in code (e.g. the renamed ai-for-you).
  // Content survives: Article/Prompt/Tool.categoryId is onDelete: SetNull.
  const removed = await prisma.category.deleteMany({
    where: { slug: { notIn: CLUSTERS.map((c) => c.slug) } },
  });
  console.log(`  categories: ${CLUSTERS.length} upserted, ${removed.count} stale removed`);

  // ── AI models ────────────────────────────────────────────────────────
  for (const [i, m] of AI_MODELS.entries()) {
    await prisma.aiModel.upsert({
      where: { slug: m.slug },
      update: { name: m.name, vendor: m.vendor, kind: m.kind, url: m.url, blurb: m.blurb, order: i },
      create: {
        slug: m.slug,
        name: m.name,
        vendor: m.vendor,
        kind: m.kind,
        url: m.url,
        blurb: m.blurb,
        order: i,
      },
    });
  }
  console.log(`  ai models: ${AI_MODELS.length}`);

  // ── Tools ────────────────────────────────────────────────────────────
  for (const t of TOOLS) {
    const category = await prisma.category.findUnique({ where: { slug: t.categorySlug } });
    const data = {
      name: t.name,
      tagline: t.tagline,
      description: sanitizeHtml(t.description),
      pricing: t.pricing,
      priceNote: t.priceNote ?? null,
      officialUrl: t.officialUrl,
      bestFor: t.bestFor,
      pros: t.pros,
      cons: t.cons,
      status: "PUBLISHED" as const,
      featured: t.featured ?? false,
      publishedAt: new Date(),
      categoryId: category?.id ?? null,
      metaTitle: `${t.name} review — ${t.tagline}`,
      metaDesc: stripHtml(t.description).slice(0, 155),
    };
    const tool = await prisma.tool.upsert({
      where: { slug: t.slug },
      update: data,
      create: { slug: t.slug, ...data },
    });

    const tagIds = await upsertTags(t.tags);
    await prisma.toolTag.deleteMany({ where: { toolId: tool.id } });
    await prisma.toolTag.createMany({
      data: tagIds.map((tagId) => ({ toolId: tool.id, tagId })),
      skipDuplicates: true,
    });
  }
  console.log(`  tools: ${TOOLS.length}`);

  // ── Prompts ──────────────────────────────────────────────────────────
  for (const p of PROMPTS) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    const model = await prisma.aiModel.findUnique({ where: { slug: p.modelSlug } });

    const data = {
      title: p.title,
      body: p.body,
      negative: p.negative ?? null,
      description: p.description,
      tips: p.tips ? sanitizeHtml(p.tips) : null,
      kind: p.kind,
      outputType: p.outputType,
      difficulty: p.difficulty,
      aspectRatio: p.aspectRatio ?? null,
      parameters: p.parameters ?? null,
      status: "PUBLISHED" as const,
      featured: p.featured ?? false,
      publishedAt: new Date(),
      authorId: author.id,
      categoryId: category?.id ?? null,
      modelId: model?.id ?? null,
      metaTitle: p.title,
      metaDesc: p.description.slice(0, 155),
    };

    const prompt = await prisma.prompt.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });

    const tagIds = await upsertTags(p.tags);
    await prisma.promptTag.deleteMany({ where: { promptId: prompt.id } });
    await prisma.promptTag.createMany({
      data: tagIds.map((tagId) => ({ promptId: prompt.id, tagId })),
      skipDuplicates: true,
    });

    await prisma.promptVariation.deleteMany({ where: { promptId: prompt.id } });
    if (p.variations?.length) {
      await prisma.promptVariation.createMany({
        data: p.variations.map((v, i) => ({
          promptId: prompt.id,
          label: v.label,
          body: v.body,
          order: i,
        })),
      });
    }

    if (p.toolSlugs?.length) {
      const tools = await prisma.tool.findMany({ where: { slug: { in: p.toolSlugs } } });
      await prisma.promptTool.deleteMany({ where: { promptId: prompt.id } });
      await prisma.promptTool.createMany({
        data: tools.map((t) => ({ promptId: prompt.id, toolId: t.id })),
        skipDuplicates: true,
      });
    }
  }
  console.log(`  prompts: ${PROMPTS.length}`);

  // ── Articles ─────────────────────────────────────────────────────────
  for (const a of ARTICLES) {
    const category = await prisma.category.findUnique({ where: { slug: a.categorySlug } });
    const content = sanitizeHtml(a.content);

    const data = {
      title: a.title,
      subtitle: a.subtitle,
      excerpt: a.excerpt,
      content,
      kind: a.kind,
      difficulty: a.difficulty ?? null,
      status: "PUBLISHED" as const,
      featured: a.featured ?? false,
      publishedAt: new Date(),
      readTime: readTimeOf(content + (a.steps ?? []).map((s) => s.body).join("")),
      authorId: author.id,
      categoryId: category?.id ?? null,
      metaTitle: a.title,
      metaDesc: a.excerpt.slice(0, 155),
    };

    const article = await prisma.article.upsert({
      where: { slug: a.slug },
      update: data,
      create: { slug: a.slug, ...data },
    });

    const tagIds = await upsertTags(a.tags);
    await prisma.articleTag.deleteMany({ where: { articleId: article.id } });
    await prisma.articleTag.createMany({
      data: tagIds.map((tagId) => ({ articleId: article.id, tagId })),
      skipDuplicates: true,
    });

    await prisma.articleStep.deleteMany({ where: { articleId: article.id } });
    for (const [i, s] of (a.steps ?? []).entries()) {
      await prisma.articleStep.create({
        data: {
          articleId: article.id,
          order: i,
          title: s.title,
          body: sanitizeHtml(s.body),
          tip: s.tip ?? null,
        },
      });
    }

    if (a.promptSlugs?.length) {
      const prompts = await prisma.prompt.findMany({ where: { slug: { in: a.promptSlugs } } });
      await prisma.articlePrompt.deleteMany({ where: { articleId: article.id } });
      await prisma.articlePrompt.createMany({
        data: prompts.map((p, i) => ({ articleId: article.id, promptId: p.id, order: i })),
        skipDuplicates: true,
      });
    }

    if (a.toolSlugs?.length) {
      const tools = await prisma.tool.findMany({ where: { slug: { in: a.toolSlugs } } });
      await prisma.articleTool.deleteMany({ where: { articleId: article.id } });
      await prisma.articleTool.createMany({
        data: tools.map((t, i) => ({ articleId: article.id, toolId: t.id, order: i })),
        skipDuplicates: true,
      });
    }
  }
  console.log(`  articles: ${ARTICLES.length}`);
}

main()
  .then(async () => {
    const counts = {
      users: await prisma.user.count(),
      categories: await prisma.category.count(),
      aiModels: await prisma.aiModel.count(),
      prompts: await prisma.prompt.count(),
      tools: await prisma.tool.count(),
      articles: await prisma.article.count(),
      tags: await prisma.tag.count(),
    };
    console.log("\nSeed complete:", counts);
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("\nSeed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
