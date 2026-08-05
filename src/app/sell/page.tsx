import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAiModels } from "@/api/aimodels";
import { getCategories } from "@/api/categories";
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

  // Shared cached lookups — see src/api/. These are identical to what /prompts
  // renders, so serving them from one cache removes two queries per page view.
  const [models, categories] = await Promise.all([getAiModels(), getCategories()]);

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
