import Image from "next/image";
import { Lightbulb } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import type { ArticleStep } from "@prisma/client";

/**
 * Renders an article's numbered steps. Also the reason ArticleStep exists as
 * rows rather than blobs of HTML: the same data drives HowTo JSON-LD.
 */
export default function StepRenderer({ steps }: { steps: ArticleStep[] }) {
  if (steps.length === 0) return null;

  return (
    <ol className="space-y-8 list-none pl-0">
      {steps.map((step, i) => (
        <li key={step.id} className="relative">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 border-ink bg-lime font-display text-lg font-bold text-ink shadow-[2px_2px_0_0_var(--ink)]"
            >
              {i + 1}
            </span>

            <div className="min-w-0 flex-1 pt-1">
              <h3 className="font-display text-xl font-bold leading-snug text-foreground">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </h3>

              <div
                className="article-content mt-2"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(step.body) }}
              />

              {step.image && (
                <figure className="mt-4">
                  <div className="relative aspect-video overflow-hidden rounded-md border-2 border-ink">
                    <Image
                      src={step.image}
                      alt={step.imageAlt || ""}
                      fill
                      sizes="(max-width: 768px) 100vw, 720px"
                      className="object-cover"
                    />
                  </div>
                </figure>
              )}

              {step.tip && (
                <aside className="mt-4 flex gap-2.5 rounded-md border-l-4 border-ink bg-paper-warm px-4 py-3">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-green-text" />
                  <p className="text-sm leading-relaxed text-foreground">{step.tip}</p>
                </aside>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
