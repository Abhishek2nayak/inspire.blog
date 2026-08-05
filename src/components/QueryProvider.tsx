"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query for the authenticated client surfaces (dashboard, editor,
 * settings). Public pages are server-rendered and cached with ISR — they never
 * touch this.
 *
 * READ THE DEFAULTS BELOW BEFORE CHANGING THEM. Stock React Query is tuned for
 * responsiveness, not for a metered database, and two of its defaults would
 * have *increased* the operation count this provider was added to reduce:
 *
 *   staleTime: 0            → every mount refetches. Navigating
 *                             dashboard → editor → back re-queries each time.
 *   refetchOnWindowFocus    → every alt-tab back to the browser refetches
 *                             every mounted query. Leaving the dashboard open
 *                             on a second monitor becomes a slow query loop.
 *
 * The values here keep the cache useful (instant back-navigation, shared data
 * between sibling components) without turning idle tabs into traffic.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState so the client is created once per browser session, not per render.
  // A new QueryClient on re-render would throw the cache away every time.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for a minute. Mounting a component that
            // already has data in cache costs zero requests inside that window.
            staleTime: 60_000,
            // Keep unused data around for 5 min so back-navigation is instant.
            gcTime: 5 * 60_000,
            // OFF deliberately — see the note above. Dashboard data is edited
            // by one admin in one tab; it does not need focus polling.
            refetchOnWindowFocus: false,
            // Reconnect refetch is worth keeping: it only fires after the
            // network actually dropped, which is a real staleness signal.
            refetchOnReconnect: true,
            // Stock is 3. A genuinely failing endpoint (unreachable DB) would
            // then cost 4 requests per mount instead of 2.
            retry: 1,
          },
          mutations: {
            // Never silently retry a write — a retried POST can double-create.
            retry: 0,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
