/**
 * Manual fill-in variables inside a prompt body — `{{product_name}}`,
 * `{{location}}`, etc. Authored by admins going forward; existing prompts
 * with no `{{}}` simply have zero placeholders, so this is additive and
 * never forces the feature on old content.
 */
const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** Unique variable names, in first-appearance order. */
export function extractPlaceholders(text: string): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const match of text.matchAll(PLACEHOLDER_RE)) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      ordered.push(name);
    }
  }
  return ordered;
}

/**
 * Substitute `{{var}}` with the matching value. A variable left blank (or
 * missing from `values`) is kept as-is — the caller decides what "filled"
 * means, this never silently blanks a placeholder out.
 */
export function fillPlaceholders(text: string, values: Record<string, string>): string {
  return text.replace(PLACEHOLDER_RE, (match, name: string) => {
    const value = values[name]?.trim();
    return value ? value : match;
  });
}

/** `product_name` -> "Product name", for form labels. */
export function humanizePlaceholder(name: string): string {
  const spaced = name.replace(/_/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
