/**
 * Delete all CONTENT rows, preserving users and their accounts.
 *
 * Deliberately safer than `prisma db push --force-reset`, which drops the
 * whole database including User — taking your admin account with it.
 *
 * Run with: npm run db:reset   (then `npm run db:seed` to repopulate)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const before = {
    users: await prisma.user.count(),
    articles: await prisma.article.count(),
    prompts: await prisma.prompt.count(),
    tools: await prisma.tool.count(),
  };
  console.log("Before:", before);

  // Order matters only where cascades don't cover it; most joins cascade
  // from their parents, but deleting explicitly keeps this readable.
  await prisma.articlePrompt.deleteMany();
  await prisma.articleTool.deleteMany();
  await prisma.promptTool.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.promptTag.deleteMany();
  await prisma.toolTag.deleteMany();
  await prisma.articleStep.deleteMany();
  await prisma.promptExample.deleteMany();
  await prisma.promptVariation.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.article.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.aiModel.deleteMany();
  await prisma.category.deleteMany();

  const after = {
    users: await prisma.user.count(), // must be unchanged
    articles: await prisma.article.count(),
    prompts: await prisma.prompt.count(),
    tools: await prisma.tool.count(),
  };
  console.log("After: ", after);

  if (after.users !== before.users) {
    throw new Error(
      `Reset deleted users (${before.users} -> ${after.users}). This should never happen.`
    );
  }
  console.log("\nContent cleared. Users preserved. Run `npm run db:seed` to repopulate.");
}

main()
  .catch((e) => {
    console.error("Reset failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
