import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Hash } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Explore All Topics | Inspire Blog",
  description:
    "Browse all topics and tags on Inspire Blog to find articles about AI, New AI Tools launched, AI Companies, AI Applications, AI Concepts, AI News, and more.",
};

async function getAllTags() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
  });
  return tags;
}

export default async function TagsIndexPage() {
  const tags = await getAllTags();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
            Explore Topics
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover articles across a wide range of topics. Dive into
            artificial intelligence, modern web development, productivity, and
            the latest technology trends.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="group flex flex-col items-center p-8 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all duration-300 text-center"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Hash size={28} />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {tag.name}
              </h2>
              <p className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                {tag._count.posts}{" "}
                {tag._count.posts === 1 ? "article" : "articles"}
              </p>
            </Link>
          ))}
        </div>

        {tags.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/50">
            <Hash className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-lg font-medium text-muted-foreground">
              No topics have been added yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
