"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import { describeApiError } from "@/lib/api-error";

export interface Profile {
  name: string;
  bio: string;
  image: string;
  website: string;
  twitter: string;
  github: string;
  location: string;
}

/** The API returns nulls for unset fields; the form wants empty strings. */
function normalize(raw: Partial<Record<keyof Profile, unknown>>): Profile {
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    name: str(raw.name),
    bio: str(raw.bio),
    image: str(raw.image),
    website: str(raw.website),
    twitter: str(raw.twitter),
    github: str(raw.github),
    location: str(raw.location),
  };
}

/**
 * The signed-in user's profile.
 *
 * `enabled` keeps this from firing before NextAuth resolves the session —
 * without it the request goes out unauthenticated, 401s, and then fires again.
 */
export function useProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile,
    enabled,
    queryFn: async (): Promise<Profile> => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error(await describeApiError(res));
      return normalize(await res.json());
    },
  });
}

/** Save the profile. */
export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (form: Profile) => {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await describeApiError(res));
      return res.json();
    },
    /**
     * invalidate, NOT setQueryData.
     *
     * The obvious optimisation is to seed the cache from the PATCH response
     * and save a round trip — but that route selects only id/name/email/
     * image/bio, so writing it into the cache would blank website, twitter,
     * github and location in the form. (It does not persist those four
     * either; that is a separate gap in /api/auth/me.) Refetching costs one
     * request on a rare action and shows what was actually stored.
     */
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}
