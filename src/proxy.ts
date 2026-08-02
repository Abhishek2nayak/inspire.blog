// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`. The export
// signature is unchanged, so next-auth's withAuth still works as-is; the
// import path below is just next-auth's own module name, not the convention.
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

/**
 * Session-required routes. This only proves "signed in" — the admin check for
 * /dashboard and /editor lives server-side in their layouts, since this layer
 * has no DB access to read User.role.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/settings/:path*",
    "/saved/:path*",
    // /sell also calls redirect() in the page itself, but by then metadata has
    // already streamed, so Next falls back to a <meta refresh> with a 1s delay.
    // Catching it here gives a clean 307 with no visible pause.
    "/sell",
  ],
};
