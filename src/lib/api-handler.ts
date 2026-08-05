import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { sqlCount } from "./prisma";

/**
 * Wrap a route handler so a thrown error becomes a JSON response instead of
 * Next's HTML 500 page.
 *
 * WHY: an unhandled throw in a route handler returns `text/html`. The client
 * then can't parse it, the real reason never reaches the browser, and
 * diagnosing a production failure means reading platform logs. Prisma errors
 * in particular carry the exact cause (unreachable database, missing table,
 * unique violation) and that belongs in the response.
 *
 * The message is safe to expose here: every route using this is behind an
 * auth check, so the caller is a signed-in user, not the public.
 */
export function withApiErrors<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    // Statement accounting per route. Off unless LOG_SQL is set, so it costs
    // nothing in production. Run `LOG_SQL=1 npm run dev`, hit an endpoint, and
    // the log line tells you what that one request actually cost the database
    // — which is the number to watch, not the count of prisma.* calls.
    const before = process.env.LOG_SQL ? sqlCount() : 0;

    try {
      const res = await handler(...args);
      if (process.env.LOG_SQL) {
        const path = args[0] instanceof Request ? new URL(args[0].url).pathname : "?";
        console.log(`[ops] ${path} → ${sqlCount() - before} SQL statements`);
      }
      return res;
    } catch (error) {
      // Always log — this is what shows up in the platform's function logs.
      console.error("[api] unhandled error:", error);

      if (error instanceof Prisma.PrismaClientInitializationError) {
        return NextResponse.json(
          {
            error:
              "Can't reach the database. If this is production, the runtime may not be able to " +
              "open a direct Postgres connection — check DATABASE_URL.",
            code: error.errorCode ?? "P1001",
          },
          { status: 503 }
        );
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const known: Record<string, string> = {
          P2002: "That already exists (unique constraint).",
          P2003: "Referenced record doesn't exist (foreign key).",
          P2021: "A database table is missing — the schema hasn't been migrated.",
          P2024: "Timed out getting a database connection from the pool.",
          P2025: "Record not found.",
        };
        return NextResponse.json(
          {
            error: known[error.code] ?? `Database error ${error.code}: ${error.message}`,
            code: error.code,
          },
          { status: error.code === "P2021" ? 503 : 400 }
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json(
          {
            error:
              "The data sent didn't match the database schema. This usually means the deployed " +
              "build and the database are out of sync.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unexpected server error." },
        { status: 500 }
      );
    }
  };
}
