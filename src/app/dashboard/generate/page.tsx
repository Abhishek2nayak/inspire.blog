"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, ArrowRight, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTED_TOPICS = [
  "Best AI Writing Tools in 2026",
  "ChatGPT vs Claude vs Gemini: Which Is Best?",
  "Best Free AI Image Generators",
  "Best AI Tools for Students",
  "How to Write Better ChatGPT Prompts",
  "How to make a YouTube thumbnail with Midjourney",
];

interface GenerateResult {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  editUrl: string;
  previewUrl: string;
}

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    const t = topic.trim();
    if (!t || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Generation failed");
      }
      setResult(data as GenerateResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-serif font-bold text-foreground">
          AI Writer
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Enter a topic and Claude will draft a complete, SEO-ready article. It is
        saved as a <strong>draft</strong> — review and publish it from the editor.
      </p>

      <form onSubmit={handleGenerate} className="space-y-3">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Best AI Writing Tools in 2026"
          disabled={loading}
          className="h-12 text-base"
        />
        <Button
          type="submit"
          disabled={loading || !topic.trim()}
          className="h-11 px-6"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Writing your article…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate draft
            </>
          )}
        </Button>
      </form>

      {!result && !loading && (
        <div className="mt-6">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Try one of these:
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TOPICS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTopic(s)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/80 hover:bg-muted transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <p className="mt-4 text-sm text-muted-foreground">
          This usually takes 20–40 seconds. Hang tight…
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
            Draft created
          </p>
          <h2 className="text-lg font-bold text-foreground">{result.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{result.excerpt}</p>
          {result.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {result.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={result.editUrl}>
              <Button className="h-10">
                <FileText className="h-4 w-4" />
                Review &amp; publish
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={result.previewUrl}>
              <Button variant="outline" className="h-10">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            The preview link works once the post is published.
          </p>
        </div>
      )}
    </div>
  );
}
