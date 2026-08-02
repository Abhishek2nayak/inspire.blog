import sanitizeHtmlLib from "sanitize-html";

/**
 * HTML sanitisation for admin/AI-authored content. SERVER ONLY.
 *
 * Applied twice on purpose (defence in depth):
 *   1. On WRITE, before persisting — so unsafe HTML never lands in the DB.
 *   2. On READ, in the server component, before the HTML is handed to a
 *      client component for rendering.
 *
 * Only admins author content, but the AI writer generates the HTML, and a
 * future prompt-injection in generated content is exactly what this guards.
 *
 * WHY sanitize-html AND NOT isomorphic-dompurify:
 * dompurify needs a DOM, so on the server it pulls in jsdom. That worked
 * locally but crashed every API route in the serverless deploy —
 * jsdom -> html-encoding-sniffer -> @exodus/bytes is ESM-only and the
 * bundled CommonJS runtime cannot require() it (ERR_REQUIRE_ESM).
 * sanitize-html parses with htmlparser2 instead: no DOM, no jsdom, and it
 * bundles cleanly. The trade-off is that it does not run in the browser,
 * which is why the one client-side call site was moved to the server.
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
  "iframe", // YouTube only — restricted by allowedIframeHostnames below
];

const options: sanitizeHtmlLib.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    // Tiptap's YouTube extension marks its wrapper with this.
    div: ["data-youtube-video"],
    "*": ["class"],
  },
  // Anything not listed here (javascript:, data:, vbscript:) is dropped.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  /**
   * Tiptap emits <div data-youtube-video><iframe src="…youtube-nocookie.com/embed/ID">.
   * Stripping every iframe would silently break all video embeds; allowing
   * any iframe is an XSS/clickjacking vector. So iframes are permitted only
   * from YouTube's embed hosts.
   */
  allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "youtube-nocookie.com"],
  // Force external links to be safe to click.
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const external = /^https?:\/\//i.test(href);
      return {
        tagName,
        attribs: external
          ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
          : attribs,
      };
    },
  },
  // Keep the text of a disallowed tag rather than discarding it wholesale.
  nonTextTags: ["style", "script", "textarea", "option", "noscript"],
};

/** Sanitize rich-text HTML from the editor or the AI writer. */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtmlLib(html, options);
}

/**
 * Strip ALL tags — for plain-text contexts (excerpts, meta descriptions,
 * prompt bodies, JSON-LD strings) where markup must never survive.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtmlLib(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
