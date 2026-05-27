import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Authors | Inspire Blog",
  description:
    "Discover the amazing developers and writers contributing to Inspire Blog.",
};

async function getAuthors() {
  const authors = await prisma.user.findMany({
    where: {
      posts: {
        some: { published: true },
      },
    },
    include: {
      _count: {
        select: { posts: { where: { published: true } } },
      },
    },
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
  });
  return authors;
}

export default async function AuthorsIndexPage() {
  const authors = await getAuthors();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Meet Our Authors
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The talented developers, designers, and tech enthusiasts sharing
            their knowledge and insights on Inspire Blog.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors.map((author) => (
            <Link
              key={author.id}
              href={`/profile/${author.id}`}
              className="group flex flex-col p-6 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-muted group-hover:border-primary transition-colors shrink-0">
                  {author.image ? (
                    <img
                      src={author.image}
                      alt={author.name || "Author"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                      <Users size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {author.name || "Anonymous"}
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground">
                    {author._count.posts}{" "}
                    {author._count.posts === 1 ? "article" : "articles"}{" "}
                    published
                  </p>
                </div>
              </div>

              {author.bio ? (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {author.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Passionate tech enthusiast and developer contributing to the
                  community.
                </p>
              )}
            </Link>
          ))}
        </div>

        {authors.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/50">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-lg font-medium text-muted-foreground">
              No authors have published any articles yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
