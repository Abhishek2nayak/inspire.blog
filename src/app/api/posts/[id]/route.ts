import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { generateSlug, calculateReadTime, getExcerpt } from "@/lib/utils";

const postInclude = {
  author: {
    select: { id: true, name: true, image: true, bio: true },
  },
  tags: {
    include: { tag: true },
  },
  _count: {
    select: { likes: true, comments: true, bookmarks: true },
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment views
    await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ ...post, views: post.views + 1 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      content,
      tags,
      published,
      coverImage,
      metaTitle,
      metaDescription,
      canonicalUrl,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      updateData.title = title;
      let slug = generateSlug(title);
      const slugConflict = await prisma.post.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugConflict) {
        slug = `${slug}-${Date.now()}`;
      }
      updateData.slug = slug;
    }

    if (content !== undefined) {
      updateData.content = content;
      updateData.readTime = calculateReadTime(content);
      updateData.excerpt = getExcerpt(content);
    }

    if (published !== undefined) {
      updateData.published = published;
      if (published && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl;

    // Handle tags update
    if (tags !== undefined && Array.isArray(tags)) {
      // Remove existing tag relations
      await prisma.postTag.deleteMany({ where: { postId: id } });

      // Upsert and reconnect tags
      if (tags.length > 0) {
        const tagRecords = await Promise.all(
          tags.map(async (tagName: string) => {
            const tagSlug = generateSlug(tagName);
            return prisma.tag.upsert({
              where: { slug: tagSlug },
              update: {},
              create: { name: tagName, slug: tagSlug },
            });
          })
        );

        await prisma.postTag.createMany({
          data: tagRecords.map((t) => ({ postId: id, tagId: t.id })),
        });
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: postInclude,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
