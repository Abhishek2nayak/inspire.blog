"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { INTERESTS } from "@/types";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const toggleInterest = (name: string) => {
    setSelectedInterests((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (selectedInterests.length < 3) {
        toast.error("Pick at least 3 interests");
        return;
      }
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selectedInterests }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setStep(3);
      setCelebrationVisible(true);

      setTimeout(() => {
        router.push("/feed");
      }, 2800);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  const userName = (session?.user?.name || "there").split(" ")[0];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Step dots */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              s === step
                ? "w-8 bg-foreground"
                : s < step
                  ? "w-2 bg-foreground/40"
                  : "w-2 bg-border"
            )}
          />
        ))}
      </div>

      {/* Step 1 — Welcome */}
      {step === 1 && (
        <div className="max-w-lg w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 border border-border rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl font-serif font-bold text-foreground">B</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-serif font-bold text-foreground">
              Hey {userName}!
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Welcome to Inspire.blog. Let&apos;s personalize your feed so you
              see content that matters to you.
            </p>
          </div>
          <div className="bg-background rounded-2xl border border-border p-6 text-left space-y-4">
            {[
              "Curated articles based on your interests",
              "Discover writers you'll love",
              "A feed that gets smarter over time",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
          <Button
            onClick={handleNext}
            className="h-12 px-10 bg-foreground text-background hover:opacity-90 font-medium text-base"
          >
            Let&apos;s get started
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Step 2 — Interest Selection */}
      {step === 2 && (
        <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              What are you into?
            </h1>
            <p className="text-muted-foreground">
              Pick at least 3 topics — you can always change these later
            </p>
          </div>

          {/* Counter */}
          <div className="flex justify-center">
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                selectedInterests.length >= 3
                  ? "border-foreground text-foreground"
                  : "border-border text-muted-foreground"
              )}
            >
              {selectedInterests.length >= 3 ? (
                <Check className="h-3.5 w-3.5" />
              ) : null}
              {selectedInterests.length} / 3 minimum selected
            </div>
          </div>

          {/* Interest grid */}
          <div className="flex flex-wrap justify-center gap-3">
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.name);
              return (
                <button
                  key={interest.name}
                  onClick={() => toggleInterest(interest.name)}
                  className={cn(
                    "border rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-200 select-none",
                    isSelected
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground"
                  )}
                >
                  {interest.name}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleNext}
              disabled={submitting}
              className="h-12 px-12 bg-foreground text-background hover:opacity-90 font-medium text-base disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Celebration */}
      {step === 3 && (
        <div
          className={cn(
            "max-w-md w-full text-center space-y-6 transition-all duration-700",
            celebrationVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 border-2 border-foreground rounded-full flex items-center justify-center">
              <Check className="h-10 w-10 text-foreground" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-serif font-bold text-foreground">
              You&apos;re all set!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your feed is ready. Discover amazing stories from writers around
              the world.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {selectedInterests.map((interest) => (
              <span
                key={interest}
                className="border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground"
              >
                {interest}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Taking you to your feed...
          </div>
        </div>
      )}
    </div>
  );
}
