"use client";

import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsletterSignupProps {
  variant?: "hero" | "sidebar" | "inline";
  title?: string;
  description?: string;
}

const inputBase =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export default function NewsletterSignup({
  variant = "inline",
  title = "New prompts, every week",
  description = "One email a week: the best new prompts, plus what actually changed in the tools.",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // TODO: wire to a real provider (Resend / ConvertKit / Buttondown).
    // Until then this is a no-op that fakes success — do not ship the
    // signup as a headline CTA while this is still a stub.
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
  }

  if (variant === "sidebar") {
    return (
      <div className="card-framed p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm border-2 border-ink bg-lime">
            <Mail className="h-3.5 w-3.5 text-ink" />
          </span>
          <h3 className="font-display text-sm font-bold text-foreground">
            {title}
          </h3>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
        {status === "success" ? (
          <p className="text-xs font-semibold text-green-text">
            Thanks — you&apos;re subscribed.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <label htmlFor="nl-sidebar" className="sr-only">
              Email address
            </label>
            <input
              id="nl-sidebar"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className={cn(inputBase, "text-xs")}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md border-2 border-ink bg-lime px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-lime-deep disabled:opacity-60"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <section className="grain border-y-2 border-ink bg-paper-warm py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            {description}
          </p>

          {status === "success" ? (
            <p className="mt-8 font-display text-lg font-bold text-green-text">
              You&apos;re in. Check your inbox.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="nl-hero" className="sr-only">
                Email address
              </label>
              <input
                id="nl-hero"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className={cn(inputBase, "flex-1 border-2 border-ink py-3")}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-ink bg-lime px-6 py-3 text-sm font-semibold text-ink shadow-[3px_3px_0_0_var(--ink)] transition-all hover:bg-lime-deep hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--ink)] disabled:opacity-60"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe free"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    );
  }

  // inline
  return (
    <div className="rounded-md border border-border bg-secondary p-6">
      <div className="mb-1 flex items-center gap-2">
        <Mail className="h-4 w-4 text-green-text" />
        <h3 className="font-display font-bold text-foreground">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      {status === "success" ? (
        <p className="text-sm font-semibold text-green-text">
          Thanks — you&apos;re subscribed.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <label htmlFor="nl-inline" className="sr-only">
            Email address
          </label>
          <input
            id="nl-inline"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            className={cn(inputBase, "flex-1")}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-md border-2 border-ink bg-lime px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-lime-deep disabled:opacity-60"
          >
            {status === "loading" ? "…" : "Join"}
          </button>
        </form>
      )}
    </div>
  );
}
