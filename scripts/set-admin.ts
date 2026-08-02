/**
 * Promote or demote a user's role. Never touches passwords.
 *
 *   npm run set-admin -- user@example.com
 *   npm run set-admin -- user@example.com READER
 *
 * Use this rather than editing the DB by hand — it verifies the user exists
 * first, so a typo fails loudly instead of silently doing nothing.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const role = (process.argv[3] ?? "ADMIN").toUpperCase();

  if (!email) {
    throw new Error("Usage: npm run set-admin -- <email> [ADMIN|READER]");
  }
  if (role !== "ADMIN" && role !== "READER") {
    throw new Error(`Role must be ADMIN or READER, got "${role}"`);
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, password: true },
  });

  if (!existing) {
    const all = await prisma.user.findMany({ select: { email: true } });
    throw new Error(
      `No user with email "${email}".\nExisting users:\n  ${all
        .map((u) => u.email)
        .join("\n  ")}`
    );
  }

  // An admin with no password and no OAuth provider cannot sign in at all.
  if (role === "ADMIN" && !existing.password) {
    const accounts = await prisma.account.count({ where: { userId: existing.id } });
    if (accounts === 0) {
      console.warn(
        `\n  WARNING: ${email} has no password and no linked OAuth account.\n` +
          `  Granting ADMIN will not make it loggable-in.\n`
      );
    }
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role },
    select: { email: true, name: true, role: true },
  });

  console.log(`\n  ${updated.email} (${updated.name}): ${existing.role} -> ${updated.role}\n`);
}

main()
  .catch((e) => {
    console.error(`\n${e instanceof Error ? e.message : e}\n`);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
