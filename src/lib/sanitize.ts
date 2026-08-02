import DOMPurify from "isomorphic-dompurify";

/**
 * HTML sanitisation for admin/AI-authored content.
 *
 * Applied in two places on purpose (defence in depth):
 *   1. On WRITE, before persisting — so unsafe HTML never lands in the DB.
 *   2. On READ, in ArticleContent — so anything already stored is still safe.
 *
 * Only admins author content now, but the AI writer generates the HTML, and
 * a future prompt-injection in generated content is exactly the case this
 * guards against.
 */

/** Tags the two producers (Tiptap editor + AI writer) actually emit. */
const ALLOWED_TAGS = [
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "mark", "sup", "sub",
  "ul", "ol", "li",
  "blockquote",
  "a",
  "img", "figure", "figcaption",
  "pre", "code",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "div", "span",
  "iframe", // YouTube only — enforced by the hook below
];

const ALLOWED_ATTR = [
  "href", "title", "target", "rel",
  "src", "alt", "width", "height", "loading",
  "colspan", "rowspan",
  "class",
  "allow", "allowfullscreen", "frameborder",
  // Tiptap's YouTube extension marks its wrapper with this
  "data-youtube-video",
];

/**
 * Tiptap's YouTube extension emits
 *   <div data-youtube-video><iframe src="https://www.youtube-nocookie.com/embed/ID">
 * A naive allowlist either strips every iframe (silently breaking all video
 * embeds) or permits arbitrary ones (an XSS/clickjacking vector). So iframes
 * are allowed as a tag, then filtered by src here.
 */
const YOUTUBE_EMBED = /^https:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\/[\w-]+/;

let hookRegistered = false;

function registerHook() {
  if (hookRegistered) return;
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName !== "iframe") return;
    const src = (node as Element).getAttribute?.("src") || "";
    if (!YOUTUBE_EMBED.test(src)) {
      (node as Element).remove?.();
    }
  });
  hookRegistered = true;
}

/** Sanitize rich-text HTML from the editor or the AI writer. */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  registerHook();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Block javascript:/data: URLs in href and src
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ["target"],
    KEEP_CONTENT: true,
  });
}

/**
 * Strip ALL tags — for plain-text contexts (excerpts, meta descriptions,
 * prompt bodies, JSON-LD strings) where markup must never survive.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, " ")
    .trim();
}
