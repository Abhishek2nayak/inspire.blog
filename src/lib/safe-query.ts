/**
 * Run a database query, falling back instead of throwing.
 *
 * WHY: `next build` prerenders static pages, and a prerender that throws
 * fails the entire deploy. That is the wrong trade — a page temporarily
 * rendering empty is far better than a build that will not ship.
 *
 * This fires in three real situations:
 *   - the production database has not been migrated yet (P2021, no tables)
 *   - Neon has scaled to zero and the first connection times out
 *   - DATABASE_URL is missing or wrong in the build environment
 *
 * Pages using this must also set `revalidate`, so a page built during an
 * outage repairs itself on the next revalidation rather than staying empty.
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const code = (error as { code?: string })?.code;
    // P2021 = table does not exist, P1001 = cannot reach database server.
    const expected = code === "P2021" || code === "P1001" || code === "P1017";

    console.warn(
      `[safe-query] ${expected ? `database not ready (${code})` : "query failed"} — ` +
        "rendering fallback. If this appears in a production build, run " +
        "`prisma db push` (or migrate deploy) against the deploy database."
    );
    if (!expected) console.warn(error);

    return fallback;
  }
}
