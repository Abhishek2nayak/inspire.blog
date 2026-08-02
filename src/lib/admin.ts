/**
 * Admin allowlist. Configure ADMIN_EMAILS in .env as a comma-separated list.
 *
 * This fails CLOSED: an empty or missing ADMIN_EMAILS means nobody is an admin.
 * Never grant admin on an empty list — that would hand the AI writer (and the
 * Anthropic bill) to every registered user.
 *
 * Phase 3 replaces this with User.role; until then this is the authority.
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
