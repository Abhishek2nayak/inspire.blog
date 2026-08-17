"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { extractPlaceholders, fillPlaceholders, humanizePlaceholder } from "@/lib/placeholders";
import CopyBlock from "./CopyBlock";

/**
 * Optional fill-in-the-blanks helper for prompts authored with `{{variable}}`
 * placeholders. Renders nothing when the text has none, so it never appears
 * — let alone forces itself — on the ~all prompts that don't use the syntax.
 */
export default function FillPromptDialog({
  text,
  promptId,
}: {
  text: string;
  promptId?: string;
}) {
  const placeholders = useMemo(() => extractPlaceholders(text), [text]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  if (placeholders.length === 0) return null;

  const filled = fillPlaceholders(text, values);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Fill in details
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fill in the details</DialogTitle>
          <DialogDescription>
            Optional — leave anything blank and its placeholder stays as{" "}
            <code className="font-mono">{"{{like_this}}"}</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {placeholders.map((name) => (
            <div key={name}>
              <label
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                htmlFor={`ph-${name}`}
              >
                {humanizePlaceholder(name)}
              </label>
              <input
                id={`ph-${name}`}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={`{{${name}}}`}
                value={values[name] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Preview
          </p>
          <CopyBlock text={filled} promptId={promptId} label="Copy filled prompt" compact />
        </div>
      </DialogContent>
    </Dialog>
  );
}
