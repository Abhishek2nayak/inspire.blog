"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ArticleContentProps {
  content: string;
  className?: string;
}

export default function ArticleContent({
  content,
  className,
}: ArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add ids to h2/h3 for TOC linking
    const headings = container.querySelectorAll("h2, h3");
    headings.forEach((heading, idx) => {
      if (!heading.id) {
        const slug = heading.textContent
          ?.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .slice(0, 60);
        heading.id = slug ? `${slug}-${idx}` : `heading-${idx}`;
      }
    });

    // Add copy buttons to code blocks
    const codeBlocks = container.querySelectorAll("pre");
    codeBlocks.forEach((pre) => {
      if (pre.querySelector(".copy-code-btn")) return;
      if (pre.style.position !== "relative") {
        pre.style.position = "relative";
      }

      const btn = document.createElement("button");
      btn.className =
        "copy-code-btn absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs px-2 py-1 rounded transition-colors";
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        const code = pre.querySelector("code");
        const text = code?.textContent || pre.textContent || "";
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = "Copy"), 2000);
        } catch {
          btn.textContent = "Failed";
          setTimeout(() => (btn.textContent = "Copy"), 2000);
        }
      });
      pre.appendChild(btn);
    });

    return () => {
      // Cleanup copy buttons on unmount
      codeBlocks.forEach((pre) => {
        pre.querySelector(".copy-code-btn")?.remove();
      });
    };
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "article-content prose prose-lg max-w-none",
        "prose-headings:font-serif prose-headings:tracking-tight",
        "prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl",
        "prose-p:leading-relaxed prose-p:text-foreground/90",
        "prose-a:text-primary prose-a:underline prose-a:underline-offset-2",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
        "prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-xl prose-pre:overflow-x-auto",
        "prose-img:rounded-xl prose-img:mx-auto",
        "prose-hr:border-border",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
