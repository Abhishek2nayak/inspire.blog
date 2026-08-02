import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * Affiliate redirector. Every outbound tool link on the site points here
 * rather than at the destination, which gives:
 *   - click counts per tool
 *   - one place to swap an affiliate programme without editing content
 *   - consistent rel="sponsored nofollow noopener" at the link sites
 *
 * Disallowed in robots.ts — there is no reason to crawl it or pass equity
 * through it.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const tool = await prisma.tool.findUnique({
    where: { slug },
    select: { id: true, officialUrl: true, affiliateUrl: true },
  });

  if (!tool) redirect("/tools");

  // Counting must never block or break the redirect.
  try {
    await prisma.tool.update({
      where: { id: tool.id },
      data: { clicks: { increment: 1 } },
    });
  } catch {
    /* ignore */
  }

  redirect(tool.affiliateUrl || tool.officialUrl);
}
