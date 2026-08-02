import React from "react";
import { notFound } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";

/**
 * Publishing is admin-only. Readers may sign up to save and comment, but the
 * editor is not part of their surface — so this 404s rather than redirecting.
 */
export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) notFound();
  return <>{children}</>;
}
