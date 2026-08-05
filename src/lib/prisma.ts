import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  sqlCount: { n: number };
};

/**
 * Count SQL statements actually sent to the database.
 *
 * COUNT STATEMENTS, NOT PRISMA CALLS. This distinction is the whole reason the
 * operation bill was a mystery: one `prisma.article.findFirst` with
 * articleDetailInclude used to emit nineteen statements, because Prisma's
 * default relation strategy issues a round trip per relation. Auditing the
 * code by counting `prisma.*` call sites therefore under-reports by 4–19×.
 *
 * The `query` event fires once per real statement, so this is the number your
 * provider bills. Kept on globalThis so dev hot-reload doesn't reset it.
 */
const counter = globalForPrisma.sqlCount ?? { n: 0 };
globalForPrisma.sqlCount = counter;

/** Total statements issued since process start. */
export const sqlCount = () => counter.n;

/**
 * Measure the statements issued by one unit of work.
 *
 *     const { result, sql } = await countSql(() => getArticle(slug));
 *     console.log(`${sql} statements`);
 *
 * Note this counts process-wide, so it is only exact when nothing else is
 * running concurrently — fine for a local `next dev` audit, not for
 * attributing statements under production load.
 */
export async function countSql<T>(fn: () => Promise<T>): Promise<{ result: T; sql: number }> {
  const before = counter.n;
  const result = await fn();
  return { result, sql: counter.n - before };
}

function createClient() {
  const client = new PrismaClient({
    // Emitted as events rather than printed, so the counter sees every
    // statement while the console stays quiet unless LOG_SQL is set.
    log: [
      { emit: "event", level: "query" },
      { emit: "stdout", level: "error" },
      ...(process.env.NODE_ENV === "development"
        ? ([{ emit: "stdout", level: "warn" }] as const)
        : []),
    ],
  });

  client.$on("query", (e: Prisma.QueryEvent) => {
    counter.n += 1;
    if (process.env.LOG_SQL) {
      // Truncated: an include-heavy statement is hundreds of characters and
      // the shape is what matters, not the full text.
      console.log(`[sql #${counter.n}] ${e.duration}ms  ${e.query.slice(0, 140)}`);
    }
  });

  return client;
}

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
