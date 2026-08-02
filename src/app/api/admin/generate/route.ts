import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/session";
import { generateArticle } from "@/lib/ai-writer";
import { createDraftFromArticle } from "@/lib/create-draft";

// Article generation can take a while — give the route room.
export const maxDuration = 120;

export async function POST(request: Request) {
  // Role comes from the database, not the JWT, so revoking admin is immediate.
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "You don't have access to the AI writer." },
      { status: 403 }
    );
  }

  let topic = "";
  try {
    const body = await request.json();
    topic = (body?.topic ?? "").toString().trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  try {
    const article = await generateArticle(topic);
    const post = await createDraftFromArticle(
      article,
      admin.id
    );

    return NextResponse.json(
      {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        tags: article.tags,
        editUrl: `/editor/${post.id}`,
        previewUrl: `/article/${post.slug}`,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("AI generate error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
