import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { absoluteUrl } from "@/lib/site-config";
import SellPromptForm from "@/components/prompt/SellPromptForm";

export const metadata: Metadata = {
  title: "Sell a prompt",
  description:
    "Submit your AI prompt to the Makeframe marketplace. Keep 80% of every sale.",
  alternates: { canonical: absoluteUrl("/sell") },
};

export default async function SellPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login?callbackUrl=/sell");

  const [models, categories] = await Promise.all([
    prisma.aiModel.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
  ]);

  return (
    <>
      <section className="grain border-b-2 border-ink bg-paper-warm">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Sell a prompt
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Keep 80% of every sale. Every submission is reviewed before it goes live, so the
            library stays worth browsing.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <SellPromptForm models={models} categories={categories} />
      </div>
    </>
  );
}
