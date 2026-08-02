import { prisma } from "./prisma";
import { getCurrentUser } from "./session";

/**
 * Who is allowed to see a paid prompt's full text.
 *
 * SECURITY NOTE: a locked body must never reach the browser. It is not enough
 * to hide it with CSS or to skip rendering it — anything passed into a client
 * component, a JSON-LD block, or a meta tag is readable in "view source".
 * Every read path goes through `resolvePromptAccess`, which strips the body
 * server-side before it is serialised.
 */

export interface PromptAccess {
  /** Free, purchased, own listing, or admin. */
  unlocked: boolean;
  /** Why it is unlocked — useful for the UI copy. */
  reason: "free" | "purchased" | "owner" | "admin" | "locked";
}

export function isPaid(prompt: { priceCents: number }): boolean {
  return prompt.priceCents > 0;
}

export async function resolvePromptAccess(prompt: {
  id: string;
  priceCents: number;
  authorId: string;
}): Promise<PromptAccess> {
  if (!isPaid(prompt)) return { unlocked: true, reason: "free" };

  const user = await getCurrentUser();
  if (!user?.id) return { unlocked: false, reason: "locked" };

  if (user.id === prompt.authorId) return { unlocked: true, reason: "owner" };

  const [me, purchase] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { role: true } }),
    prisma.purchase.findUnique({
      where: { userId_promptId: { userId: user.id, promptId: prompt.id } },
      select: { status: true },
    }),
  ]);

  if (me?.role === "ADMIN") return { unlocked: true, reason: "admin" };
  if (purchase?.status === "COMPLETED") return { unlocked: true, reason: "purchased" };

  return { unlocked: false, reason: "locked" };
}

/**
 * A short teaser of a locked prompt.
 *
 * Enough to judge the writing style, not enough to reconstruct the prompt.
 * Cut on a word boundary so it doesn't end mid-word.
 */
export function teaser(body: string, chars = 140): string {
  if (body.length <= chars) {
    // Very short prompts would be given away entirely by a "preview", so
    // show only the first half.
    const half = Math.max(40, Math.floor(body.length / 2));
    return body.slice(0, half).trimEnd();
  }
  const cut = body.slice(0, chars);
  return cut.slice(0, cut.lastIndexOf(" ")).trimEnd();
}

/**
 * Assemble the whole listing into one paste-ready string.
 *
 * Readers were having to copy the body, the negative prompt and the
 * parameters separately and stitch them together by hand — which is exactly
 * the busywork this site exists to remove.
 *
 * The shape depends on the tool. Midjourney-style CLI flags take the negative
 * inline as `--no ...` on the same line; everything else expects it on its own
 * labelled line. Detected from the parameters rather than the model name, so
 * a new Midjourney-like tool works without a code change.
 */
export function buildFullPrompt(prompt: {
  body: string;
  negative?: string | null;
  parameters?: string | null;
}): string {
  const body = prompt.body.trim();
  const negative = prompt.negative?.trim();
  const params = prompt.parameters?.trim();

  const cliStyle = Boolean(params && /(^|\s)--\w/.test(params));

  if (cliStyle) {
    // Midjourney and friends: one line, negative folded in as --no.
    const alreadyHasNo = /(^|\s)--no(\s|$)/.test(params!);
    const noFlag = negative && !alreadyHasNo ? ` --no ${negative}` : "";
    return `${body}${noFlag} ${params}`.replace(/\s+/g, " ").trim();
  }

  const parts = [body];
  if (negative) parts.push(`Negative prompt: ${negative}`);
  if (params) parts.push(params);
  return parts.join("\n\n");
}

/** Money formatting. Prices are stored as integer cents. */
export function formatPrice(cents: number, currency = "USD"): string {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** Split a price into platform fee and seller earnings, in whole cents. */
export function splitPrice(priceCents: number, feePercent: number) {
  const platformFeeCents = Math.round((priceCents * feePercent) / 100);
  return {
    platformFeeCents,
    sellerEarnsCents: priceCents - platformFeeCents,
  };
}
