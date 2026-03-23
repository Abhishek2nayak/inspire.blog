import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const textContent = content
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = textContent.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return formatDistanceToNow(d, { addSuffix: true });
  if (diffDays < 7) return formatDistanceToNow(d, { addSuffix: true });
  if (diffDays < 365) return format(d, "MMM d");
  return format(d, "MMM d, yyyy");
}

export function getExcerpt(content: string, maxLength = 160): string {
  const text = content
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
