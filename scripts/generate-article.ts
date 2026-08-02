/**
 * CLI: generate an article draft from a topic and save it to the database.
 *
 *   npx tsx scripts/generate-article.ts "Best AI Writing Tools in 2026"
 *
 * Requires ANTHROPIC_API_KEY and DATABASE_URL in .env.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env into process.env BEFORE importing prisma/anthropic (which read env).
function loadEnv() {
  try {
    const txt = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // no .env — rely on the real environment
  }
}

async function main() {
  loadEnv();

  const topic = process.argv.slice(2).join(" ").trim();
  if (!topic) {
    console.error('Usage: npx tsx scripts/generate-article.ts "Your topic here"');
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY is not set in .env. Get a key at https://console.claude.com"
    );
    process.exit(1);
  }

  // Dynamic imports so env is loaded before these modules initialise.
  const { generateArticle } = await import("../src/lib/ai-writer");
  const { createDraftFromArticle } = await import("../src/lib/create-draft");
  const { prisma } = await import("../src/lib/prisma");
  const { getAdminEmails } = await import("../src/lib/admin");

  // Pick an author: first admin user, else the oldest user.
  const adminEmails = getAdminEmails();
  let author =
    adminEmails.length > 0
      ? await prisma.user.findFirst({ where: { email: { in: adminEmails } } })
      : null;
  if (!author) {
    author = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  }
  if (!author) {
    console.error("No user found in the database. Register an account first.");
    process.exit(1);
  }

  console.log(`\n✍️  Generating draft for: "${topic}"`);
  console.log("    (using claude-opus-4-8 — this takes ~20-40s)\n");

  const article = await generateArticle(topic);
  const post = await createDraftFromArticle(article, author.id);

  console.log("✅ Draft created!\n");
  console.log("   Title:  ", post.title);
  console.log("   Slug:   ", post.slug);
  console.log("   Tags:   ", article.tags.join(", "));
  console.log("   Author: ", author.email);
  console.log("\n   Review & publish:  /editor/" + post.id);
  console.log("   Live URL (after publish):  /article/" + post.slug + "\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\n❌ Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
