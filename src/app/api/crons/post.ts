import { prisma } from "@/lib/prisma";

export async function publishScheduledPosts() {
  try {
    console.log("Publishing scheduled posts");
    
    const scheduledPosts = await prisma.scheduledPost.findMany({
      include: { post: true },
      where: {
        post: {
          scheduledAt: { lte: new Date() },
          published: false,
        },
      },
    });
    console.log("Scheduled posts", scheduledPosts);
    const postIds = scheduledPosts.map((sp) => sp.post.id);
    console.log("Post ids", postIds);
    await prisma.post.updateMany({
      where: { id: { in: postIds } },
      data: {
        published: true,
        publishedAt: new Date(),
        scheduledAt: null,
      },
    });
    console.log("Posts updated");
    await prisma.scheduledPost.deleteMany({
      where: { postId: { in: postIds } },
    });
    console.log("Scheduled posts deleted");
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
