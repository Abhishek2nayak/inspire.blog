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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "latest";
    const mine = searchParams.get("mine") === "true";
    const includeDrafts = searchParams.get("include_drafts") === "true";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // If "mine=true", filter to current user's posts only
    if (mine) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      where.authorId = user.id;
      // Include drafts when requested, otherwise published only
      if (!includeDrafts) {
        where.published = true;
      }
    } else {
      // Public feed — only published posts
      where.published = true;
    }

    if (tag) {
      where.tags = {
        some: { tag: { slug: tag } },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, string> = { publishedAt: "desc" };
    if (sort === "trending") {
      orderBy = { views: "desc" };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: postInclude,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      tags,
      published,
      coverImage,
      metaTitle,
      metaDesc: metaDescription,
      canonical: canonicalUrl,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    let slug = generateSlug(title);

    // Ensure slug uniqueness
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const readTime = calculateReadTime(content);
    const excerpt = getExcerpt(content);

    // Upsert tags and connect
    let tagConnections: { tag: { connect: { id: string } } }[] = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
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
      tagConnections = tagRecords.map((t) => ({
        tag: { connect: { id: t.id } },
      }));
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published: published || false,
        metaTitle,
        metaDesc: metaDescription,
        canonical: canonicalUrl,
        readTime,
        publishedAt: published ? new Date() : null,
        authorId: user.id,
        tags: {
          create: tagConnections,
        },
      },
      include: postInclude,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
