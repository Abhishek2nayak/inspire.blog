"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

interface ArticleContentProps {
  content: string;
  className?: string;
}

export default function ArticleContent({ content, className }: ArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Sanitised on write too, before it ever reaches the DB. Doing it again here
   * is defence in depth: anything already stored from before that guard
   * existed, or introduced by a future prompt-injection in generated content,
   * still cannot execute.
   */
  const safe = useMemo(() => sanitizeHtml(content), [content]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Heading ids for the table of contents.
    container.querySelectorAll("h2, h3").forEach((heading, idx) => {
      if (heading.id) return;
      const slug = heading.textContent
        ?.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 60);
      heading.id = slug ? `${slug}-${idx}` : `heading-${idx}`;
    });

    const codeBlocks = Array.from(container.querySelectorAll("pre"));
    codeBlocks.forEach((pre) => {
      if (pre.querySelector(".copy-code-btn")) return;
      pre.style.position = "relative";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "copy-code-btn absolute top-2 right-2 rounded-sm border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/80 transition-colors hover:bg-white/20 hover:text-white";
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        const text = pre.querySelector("code")?.textContent || pre.textContent || "";
        let ok = false;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            ok = true;
          }
        } catch {
          ok = false;
        }
        // Same reason as CopyBlock: clipboard API is undefined on plain http,
        // so fall back rather than silently doing nothing.
        if (!ok) {
          try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            ok = document.execCommand("copy");
            document.body.removeChild(ta);
          } catch {
            ok = false;
          }
        }
        btn.textContent = ok ? "Copied" : "Press Ctrl+C";
        setTimeout(() => (btn.textContent = "Copy"), 2000);
      });
      pre.appendChild(btn);
    });

    return () => {
      codeBlocks.forEach((pre) => pre.querySelector(".copy-code-btn")?.remove());
    };
  }, [safe]);

  return (
    <div
      ref={containerRef}
      // Styling comes entirely from the .article-content block in globals.css.
      // The prose-* utilities that used to be here were no-ops —
      // @tailwindcss/typography is not installed — and having two competing
      // systems is worse than one that works.
      className={cn("article-content max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
