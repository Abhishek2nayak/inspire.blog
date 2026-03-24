import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ArticleCard from "@/components/article/ArticleCard";
import FollowButton from "@/components/shared/FollowButton";
import type { PostWithAuthor } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";
import { Globe, Twitter, Github, CalendarDays, FileText, Users } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: { where: { published: true } },
          followers: true,
          following: true,
        },
      },
    },
  });
}

async function getUserPosts(userId: string): Promise<PostWithAuthor[]> {
  return prisma.post.findMany({
    where: { authorId: userId, published: true },
    include: {
      author: {
        select: { id: true, name: true, image: true, bio: true },
      },
      tags: {
        include: { tag: true },
      },
      _count: {
        select: { likes: true, comments: true, bookmarks: true, reactions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  }) as unknown as PostWithAuthor[];
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) {
    return { title: "User Not Found" };
  }

  return {
    title: `${user.name || "User"} — Inspire.blog`,
    description: user.bio || `Read articles by ${user.name}`,
    openGraph: {
      title: `${user.name || "User"}`,
      description: user.bio || undefined,
      images: user.image ? [user.image] : undefined,
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) {
    notFound();
  }

  const [posts, currentUser] = await Promise.all([
    getUserPosts(user.id),
    getCurrentUser(),
  ]);

  // Check if current user follows this user
  let isFollowing = false;
  if (currentUser && currentUser.id !== user.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <main className="min-h-screen bg-background">
      {/* Cover — clean dark bar */}
      <div className="h-36 bg-foreground" />

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-background rounded-2xl border border-border -mt-12 mb-10 p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg flex-shrink-0 -mt-16">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="text-2xl bg-muted text-muted-foreground font-bold">
                {getInitials(user.name || "U")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h1 className="text-2xl font-serif font-bold text-foreground">
                  {user.name}
                </h1>
                {!isOwnProfile && (
                  <FollowButton
                    userId={user.id}
                    initialFollowing={isFollowing}
                  />
                )}
                {isOwnProfile && (
                  <Link
                    href="/settings"
                    className="text-sm text-muted-foreground hover:text-foreground font-medium border border-border hover:border-foreground rounded-full px-4 py-1.5 transition-colors"
                  >
                    Edit profile
                  </Link>
                )}
              </div>

              {user.bio && (
                <p className="text-muted-foreground leading-relaxed mb-4 max-w-xl">
                  {user.bio}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-4">
                <div className="flex items-center gap-1.5 border-r border-border pr-6">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <strong className="text-foreground">{user._count.posts}</strong>
                  <span className="text-muted-foreground">Posts</span>
                </div>
                <div className="flex items-center gap-1.5 border-r border-border pr-6">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <strong className="text-foreground">
                    {user._count.followers}
                  </strong>
                  <span className="text-muted-foreground">Followers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <strong className="text-foreground">
                    {user._count.following}
                  </strong>
                  <span className="text-muted-foreground">Following</span>
                </div>
                {user.createdAt && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                )}
              </div>

              {/* Social links */}
              <div className="flex flex-wrap items-center gap-3">
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {user.twitter && (
                  <a
                    href={`https://twitter.com/${user.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Twitter className="h-4 w-4" />@{user.twitter}
                  </a>
                )}
                {user.github && (
                  <a
                    href={`https://github.com/${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    {user.github}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Articles
            </span>
            <Badge
              variant="outline"
              className="font-normal"
            >
              {posts.length}
            </Badge>
            <Separator className="flex-1" />
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-2xl border border-border">
              <div className="w-12 h-12 bg-background border border-border rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No published articles yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        <div className="pb-16" />
      </div>
    </main>
  );
}
