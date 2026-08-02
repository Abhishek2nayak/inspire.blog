/**
 * Create (or update) an admin account with a password.
 *
 *   npm run create-admin -- <email> <password>
 *
 * The password is taken as an argument and never written to a file — it is
 * bcrypt-hashed before it touches the database. Re-running for an existing
 * email resets that account's password and promotes it to ADMIN.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

async function main() {
  loadEnv();

  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.argv[3];

  if (!email || !password) {
    throw new Error("Usage: npm run create-admin -- <email> <password>");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const prisma = new PrismaClient();
  try {
    const hashed = await bcrypt.hash(password, 12);
    const existed = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashed, role: "ADMIN" },
      create: {
        email,
        name: email.split("@")[0],
        password: hashed,
        role: "ADMIN",
      },
      select: { email: true, name: true, role: true },
    });

    console.log(`\n  ${existed ? "Updated" : "Created"} ${user.email} as ${user.role}`);
    console.log("  Password set. Sign in at /login with the credentials you passed.\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(`\n  ${e instanceof Error ? e.message : e}\n`);
  process.exit(1);
});
