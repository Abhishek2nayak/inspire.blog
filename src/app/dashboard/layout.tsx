import React from "react";
import { notFound } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import DashboardShell from "@/components/layout/DashboardShell";

/**
 * Server-side admin gate.
 *
 * This was previously a client component that only checked "is there a
 * session", which meant ANY registered reader could open the dashboard and
 * reach the AI writer. Role is read from the database on every request.
 *
 * notFound() rather than redirect(): a non-admin should not learn that this
 * route exists.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) notFound();

  return (
    <DashboardShell
      user={{ name: admin.name, email: admin.email, image: admin.image }}
    >
      {children}
    </DashboardShell>
  );
}
