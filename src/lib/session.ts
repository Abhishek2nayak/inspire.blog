import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/**
 * The authoritative admin check. Reads User.role from the database rather
 * than trusting the JWT, so revoking admin takes effect immediately instead
 * of waiting for a token to expire.
 *
 * Fails closed: no session, unknown user, or a DB error all mean "not admin".
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user?.id) return false;

  try {
    const row = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    return row?.role === "ADMIN";
  } catch {
    return false;
  }
}

/** Current user plus their role, for surfaces that need both. */
export async function getCurrentAdmin() {
  const user = await getCurrentUser();
  if (!user?.id) return null;

  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, image: true, role: true },
  });
  return row?.role === "ADMIN" ? row : null;
}
