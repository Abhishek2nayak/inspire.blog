"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function PasswordStrength({ password }: { password: string }) {
  const isStrong = password.length >= 8;
  const isMedium = password.length >= 6 && password.length < 8;
  const isEmpty = password.length === 0;

  if (isEmpty) return null;

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1.5">
        <div
          className={cn(
            "h-1 flex-1 rounded-full transition-all duration-300",
            password.length >= 1 ? "bg-red-400" : "bg-gray-200"
          )}
        />
        <div
          className={cn(
            "h-1 flex-1 rounded-full transition-all duration-300",
            isMedium || isStrong ? "bg-amber-400" : "bg-gray-200"
          )}
        />
        <div
          className={cn(
            "h-1 flex-1 rounded-full transition-all duration-300",
            isStrong ? "bg-foreground" : "bg-gray-200"
          )}
        />
      </div>
      <p
        className={cn(
          "text-xs font-medium transition-colors",
          isStrong
            ? "text-foreground"
            : isMedium
              ? "text-amber-600"
              : "text-red-500"
        )}
      >
        {isStrong ? (
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3" />
            Strong password
          </span>
        ) : isMedium ? (
          "Almost there — use 8+ characters"
        ) : (
          "Too short"
        )}
      </p>
    </div>
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
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
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
        toast({
          title: "Registration failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      // Auto sign in after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Account created!",
          description: "Please sign in with your new credentials.",
        });
        router.push("/login");
      } else {
        toast({
          title: "Welcome to Inspire.blog!",
          description: "Let's personalize your experience.",
        });
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/onboarding" });
  };

  return (
    <div className="w-full space-y-8">
      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join thousands of writers and readers
        </p>
      </div>

      {/* Google Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-3 font-medium"
        onClick={handleGoogleSignUp}
        disabled={googleLoading || loading}
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground uppercase tracking-wider">
            or sign up with email
          </span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Full name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            disabled={loading}
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={loading}
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-foreground text-background hover:opacity-90 font-medium"
          disabled={loading || googleLoading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Sign in link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
