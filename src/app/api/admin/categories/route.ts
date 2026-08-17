import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/session";
import { generateSlug } from "@/lib/utils";
import { revalidateLookups } from "@/api/revalidate";

/** GET — every category, with content counts for the admin table. */
async function GETHandler() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { prompts: true, articles: true, tools: true } },
    },
  });

  return NextResponse.json({ categories });
}

/** POST — create a category. */
async function POSTHandler(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  let slug = generateSlug(String(body.slug || name));
  if (await prisma.category.findUnique({ where: { slug } })) {
    return NextResponse.json(
      { error: `A category with slug "${slug}" already exists.` },
      { status: 409 }
    );
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      tagline: body.tagline ? String(body.tagline) : null,
      description: body.description ? String(body.description) : null,
      chip: body.chip ? String(body.chip) : "lime",
      order: body.order !== undefined ? Number(body.order) : 0,
    },
  });

  revalidateLookups();
  return NextResponse.json(category, { status: 201 });
}

export const GET = withApiErrors(GETHandler);
export const POST = withApiErrors(POSTHandler);
