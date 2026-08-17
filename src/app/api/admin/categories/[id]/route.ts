import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/session";
import { generateSlug } from "@/lib/utils";
import { revalidateLookups } from "@/api/revalidate";

/** PATCH — update a category. */
async function PATCHHandler(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let slug: string | undefined;
  if (body.slug !== undefined && String(body.slug) !== existing.slug) {
    slug = generateSlug(String(body.slug));
    const clash = await prisma.category.findUnique({ where: { slug } });
    if (clash && clash.id !== id) {
      return NextResponse.json(
        { error: `A category with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: String(body.name) } : {}),
      ...(slug ? { slug } : {}),
      ...(body.tagline !== undefined ? { tagline: String(body.tagline) || null } : {}),
      ...(body.description !== undefined
        ? { description: String(body.description) || null }
        : {}),
      ...(body.chip !== undefined ? { chip: String(body.chip) } : {}),
      ...(body.order !== undefined ? { order: Number(body.order) } : {}),
    },
  });

  revalidateLookups();
  return NextResponse.json(category);
}

/** DELETE — remove a category. Prompts/articles/tools referencing it are
 * SetNull at the DB level, so this never orphan-crashes. */
async function DELETEHandler(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateLookups();
  return NextResponse.json({ ok: true });
}

export const PATCH = withApiErrors(PATCHHandler);
export const DELETE = withApiErrors(DELETEHandler);
