import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/session";

/**
 * Attach an example output to a prompt.
 *
 * The image itself is uploaded separately via POST /api/upload (Cloudinary),
 * which returns a URL plus dimensions — this just records it. Width and
 * height are stored because next/image needs them to avoid layout shift, and
 * ImageObject JSON-LD needs them for image rich results.
 */
async function POSTHandler(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prompt = await prisma.prompt.findUnique({
    where: { id },
    select: { id: true, _count: { select: { examples: true } } },
  });
  if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const url = String(body.url ?? "").trim();
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  const example = await prisma.promptExample.create({
    data: {
      promptId: id,
      url,
      alt: body.alt ? String(body.alt) : null,
      caption: body.caption ? String(body.caption) : null,
      isVideo: Boolean(body.isVideo),
      width: body.width ? Number(body.width) : null,
      height: body.height ? Number(body.height) : null,
      order: prompt._count.examples,
    },
  });

  return NextResponse.json(example, { status: 201 });
}

/** DELETE ?exampleId=… — remove one example. */
async function DELETEHandler(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exampleId = new URL(req.url).searchParams.get("exampleId");
  if (!exampleId) {
    return NextResponse.json({ error: "exampleId is required" }, { status: 400 });
  }

  try {
    // Scoped by promptId so an id from another prompt can't be deleted here.
    await prisma.promptExample.delete({ where: { id: exampleId, promptId: id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export const POST = withApiErrors(POSTHandler);
export const DELETE = withApiErrors(DELETEHandler);
