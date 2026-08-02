"use client";

import { useState } from "react";
import Logo from "@/components/shared/Logo";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Clean input ── */
function AuthInput({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  disabled,
  suffix,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  disabled?: boolean;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-[var(--ink-soft)]">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center rounded-lg border bg-white transition-all duration-150",
          focused ? "border-[var(--green-text)] ring-2 ring-[var(--green-text)]/10" : "border-[var(--rule)]"
        )}
      >
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 h-10 px-3 bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--rule)] focus:outline-none disabled:opacity-50"
        />
        {suffix && <span className="pr-3 flex items-center">{suffix}</span>}
      </div>
    </div>
  );
}

/* ── Password strength ── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /\d/.test(password);
  const score = (len >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0);
  const colors = ["bg-red-400", "bg-amber-400", "bg-[var(--green-text)]"];
  const labels = ["Weak", "Fair", "Strong"];
  const textColors = ["text-red-500", "text-amber-600", "text-[var(--green-text)]"];

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn("h-1 flex-1 rounded-full transition-all duration-300",
              i < score ? colors[score - 1] : "bg-[var(--paper-cool)]"
            )}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={cn("text-[11px] font-medium flex items-center gap-1", textColors[score - 1])}>
          {score === 3 && <Check className="h-3 w-3" />}
          {labels[score - 1]}
        </p>
      )}
    </div>
  );
}

/* ── Google SVG ── */
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Missing fields", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "At least 6 characters required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Registration failed", description: data.error || "Something went wrong", variant: "destructive" });
        return;
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/onboarding" });
  };

  return (
    <div className="w-full">

      {/* Brand heading */}
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold tracking-[0.25em] text-[var(--green-text)] uppercase mb-1">
          Join for free
        </p>
        <Logo size="lg" asLink={false} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <AuthInput
          id="name"
          label="Full name"
          type="text"
          placeholder="Jane Smith"
          value={name}
          onChange={setName}
          autoComplete="name"
          disabled={loading}
        />

        <AuthInput
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          disabled={loading}
        />

        <div>
          <AuthInput
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            disabled={loading}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[var(--rule)] hover:text-[var(--green-text)] transition-colors"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            }
          />
          <PasswordStrength password={password} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-10 flex items-center justify-center rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--ink)" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--paper-cool)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-[var(--rule-strong)]">or</span>
        </div>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={googleLoading || loading}
        className="w-full h-10 flex items-center justify-center gap-2.5 rounded-lg border border-[var(--rule)] bg-white text-sm text-[var(--ink)] font-medium hover:bg-[var(--paper-cool)] hover:border-[var(--rule-strong)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin text-[var(--rule-strong)]" /> : <GoogleIcon />}
        Sign up with Google
      </button>

      {/* Sign in link */}
      <p className="mt-4 text-center text-xs text-[var(--ink-soft)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--green-text)] font-medium hover:text-[var(--green-deep)] hover:underline transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
