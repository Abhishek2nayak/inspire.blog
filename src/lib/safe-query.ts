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
    // P2021 = table does not exist, P1001 = cannot reach database server,
    // P1017 = server closed the connection.
    const expected = code === "P2021" || code === "P1001" || code === "P1017";

    if (expected) {
      console.warn(
        `[safe-query] database not ready (${code}) — rendering fallback. If ` +
          "this appears in a production build, run `prisma db push` (or " +
          "migrate deploy) against the deploy database."
      );
    } else {
      // Anything else is a real, unexplained bug — a query shape mismatch, a
      // relationJoins/pgbouncer incompatibility, etc. Previously this was
      // logged at `warn` and easy to miss; log it at `error` with the full
      // object so it's unmissable in the platform's function logs. Still
      // falls back rather than throwing — a page rendering empty stays far
      // better than a hard 500 for real visitors — but "empty" should never
      // again mean "silent."
      console.error("[safe-query] unexpected error — rendering fallback:", error);
    }

    return fallback;
  }
}
