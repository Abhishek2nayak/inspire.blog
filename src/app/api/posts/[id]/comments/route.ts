import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = { postId: id, parentId: null };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, image: true, bio: true },
          },
          replies: {
            include: {
              author: {
                select: { id: true, name: true, image: true, bio: true },
              },
              replies: {
                include: {
                  author: {
                    select: { id: true, name: true, image: true, bio: true },
                  },
                },
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // If replying, verify parent comment exists and belongs to the same post
    if (parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: { id: parentId, postId: id },
      });
      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: user.id,
        postId: id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, bio: true },
        },
      },
    });

    // Create notification for post author (don't notify self)
    if (post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          recipientId: post.authorId,
          actorId: user.id,
        },
      });
    }

    // If it's a reply, also notify the parent comment author
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (
        parentComment &&
        parentComment.authorId !== user.id &&
        parentComment.authorId !== post.authorId
      ) {
        await prisma.notification.create({
          data: {
            type: "COMMENT",
            recipientId: parentComment.authorId,
            actorId: user.id,
          },
        });
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
