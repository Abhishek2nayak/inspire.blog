"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin progress bar across the top during navigation.
 *
 * loading.tsx handles the page body, but there is still a beat between the
 * click and the skeleton painting while the server responds. Without feedback
 * in that window the click reads as ignored — this fills it.
 *
 * Start is driven by intercepting same-origin link clicks (the only reliable
 * "navigation began" signal in the App Router); completion is the pathname
 * or query actually changing.
 */
export default function NavProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.forEach((t) => window.clearInterval(t));
    timers.current = [];
  }

  // ── Start on internal link clicks ────────────────────────────────────
  useEffect(() => {
    function onClick(e: MouseEvent) {
      // Ignore modified clicks — those open a new tab, not a navigation.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same URL: no navigation will occur, so no bar.
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      clearTimers();
      // 120ms delay: flashing a bar on instant cached navigations is noisier
      // than showing nothing at all.
      const show = window.setTimeout(() => {
        setVisible(true);
        setWidth(12);
        const tick = window.setInterval(() => {
          // Ease toward 90% and wait — the route change completes it.
          setWidth((w) => (w >= 90 ? 90 : w + (90 - w) * 0.14));
        }, 130);
        timers.current.push(tick);
      }, 120);
      timers.current.push(show);
    }

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimers();
    };
  }, []);

  // ── Complete when the route actually changes ─────────────────────────
  useEffect(() => {
    clearTimers();
    setWidth((w) => (w > 0 ? 100 : 0));
    const hide = window.setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 240);
    timers.current.push(hide);

    return clearTimers;
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      <div
        className="h-full bg-ink transition-[width] duration-200 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
