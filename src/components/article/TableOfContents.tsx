"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content: _content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Extract headings from the rendered DOM after article mounts
    const articleEl = document.querySelector(".article-content");
    if (!articleEl) return;

    const els = articleEl.querySelectorAll("h2, h3");
    const extracted: Heading[] = [];

    els.forEach((el, idx) => {
      const level = el.tagName === "H2" ? 2 : 3;

      // Get clean text: clone the element, remove any <a> children that are
      // purely navigation anchors (empty text or only contain icon/svg content),
      // then read innerText so we get the visible rendered text only.
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("a").forEach((a) => {
        // If the anchor has no visible text (icon-only), remove it entirely
        if (!a.innerText?.trim()) a.remove();
      });
      const text = clone.innerText?.trim() || clone.textContent?.trim() || "";

      // Skip empty headings or very short ones (< 2 chars)
      if (text.length < 2) return;

      // Assign id based on clean text if not already set
      if (!el.id) {
        const slug = text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .slice(0, 60);
        el.id = slug ? `${slug}-${idx}` : `heading-${idx}`;
      }
      extracted.push({
        id: el.id,
        text,
        level: level as 2 | 3,
      });
    });

    setHeadings(extracted);
  }, []);

  // Intersection observer to highlight current heading
  useEffect(() => {
    if (!headings.length) return;

    observerRef.current?.disconnect();

    const callback: IntersectionObserverCallback = (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) {
        setActiveId(visible[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "0px 0px -70% 0px",
      threshold: 0,
    });

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 hidden xl:block w-56 shrink-0"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        On this page
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
            <button
              type="button"
              onClick={() => handleClick(h.id)}
              className={cn(
                "block text-left w-full text-sm leading-snug transition-colors",
                activeId === h.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
