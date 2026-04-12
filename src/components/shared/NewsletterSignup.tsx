"use client";

import { useState } from "react";
import { Mail, ArrowRight, Sparkles } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "hero" | "sidebar" | "inline";
  title?: string;
  description?: string;
}

export default function NewsletterSignup({
  variant = "inline",
  title = "Stay in the loop",
  description = "Get the best articles delivered to your inbox every week.",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // API-ready: replace with your email service (Resend, Mailchimp, ConvertKit)
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
  }

  if (variant === "sidebar") {
    return (
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <Mail className="h-3.5 w-3.5 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <p className="mb-4 text-xs text-muted-foreground leading-relaxed">{description}</p>
        {status === "success" ? (
          <p className="text-xs font-medium text-blue-600">Thanks! You&apos;re subscribed.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
      <section className="relative overflow-hidden border-t border-border bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)]" />
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300">
            <Sparkles className="h-3 w-3" /> Weekly curated reads
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mb-8 text-lg text-slate-400">{description}</p>
          {status === "success" ? (
            <p className="text-lg font-semibold text-blue-400">You&apos;re in! Check your inbox.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 disabled:opacity-60"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe free"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
          <p className="mt-4 text-xs text-slate-500">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    );
  }

  // inline variant
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-6">
      <div className="mb-1 flex items-center gap-2">
        <Mail className="h-4 w-4 text-blue-600" />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      {status === "success" ? (
        <p className="text-sm font-medium text-blue-600">Thanks! You&apos;re subscribed.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {status === "loading" ? "…" : "Join"}
          </button>
        </form>
      )}
    </div>
  );
}
