import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** text size — default is "text-xl" */
  size?: "sm" | "md" | "lg";
  /** whether to wrap in a Link to "/" */
  asLink?: boolean;
}

const sizeMap = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

function LogoMark({ size = "md", className }: LogoProps) {
  return (
    <span
      className={cn(
        "font-playfair font-bold tracking-tight select-none leading-none",
        sizeMap[size],
        className
      )}
      style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}
    >
      <span className="text-foreground">inspire.blog</span>
      <span style={{ color: "#2d7d59" }}>.</span>
    </span>
  );
}

export default function Logo({ size = "md", className, asLink = true }: LogoProps) {
  if (!asLink) return <LogoMark size={size} className={className} />;
  return (
    <Link href="/" className={cn("inline-flex items-center hover:opacity-80 transition-opacity", className)}>
      <LogoMark size={size} />
    </Link>
  );
}
