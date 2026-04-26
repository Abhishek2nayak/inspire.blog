import { TipNode } from "@/components/editor/BlogEditor";

/**
 * 
 * @param s string to be escaped
 * @returns escaped string
 */
export function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * 
 * @param t string to be escaped
 * @returns escaped string
 */

export function applyInline(t: string): string {
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  t = t.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__([^_\n]+)__/g, "<strong>$1</strong>");
  t = t.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  t = t.replace(/_([^_\n]+)_/g, "<em>$1</em>");
  t = t.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  return t;
}


export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      out.push(
        `<pre><code class="language-${lang}">${escHtml(code.join("\n"))}</code></pre>`,
      );
      i++;
      continue;
    }
    // Heading
    const hm = line.match(/^(#{1,6})\s+(.+)/);
    if (hm) {
      const l = hm[1].length;
      out.push(`<h${l}>${applyInline(hm[2])}</h${l}>`);
      i++;
      continue;
    }
    // HR
    if (/^---+$/.test(line.trim())) {
      out.push("<hr>");
      i++;
      continue;
    }
    // Blockquote
    if (line.startsWith("> ")) {
      const ql: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        ql.push(lines[i].slice(2));
        i++;
      }
      out.push(`<blockquote><p>${applyInline(ql.join(" "))}</p></blockquote>`);
      continue;
    }
    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${applyInline(lines[i].replace(/^[-*]\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(
          `<li>${applyInline(lines[i].replace(/^\d+\.\s+/, ""))}</li>`,
        );
        i++;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }
    // Empty
    if (line.trim() === "") {
      i++;
      continue;
    }
    // Paragraph
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("> ") &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim())
    ) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) out.push(`<p>${applyInline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}


export function inlineToMd(nodes: TipNode[] | undefined): string {
  if (!nodes) return "";
  return nodes
    .map((n) => {
      if (n.type === "text") {
        let t = n.text ?? "";
        const marks = n.marks ?? [];
        if (marks.some((m) => m.type === "bold")) t = `**${t}**`;
        if (marks.some((m) => m.type === "italic")) t = `*${t}*`;
        if (marks.some((m) => m.type === "code")) t = `\`${t}\``;
        const link = marks.find((m) => m.type === "link");
        if (link) t = `[${t}](${link.attrs?.href ?? ""})`;
        return t;
      }
      if (n.type === "hardBreak") return "\n";
      return "";
    })
    .join("");
}

export function nodeToMd(node: TipNode, depth = 0): string {
  switch (node.type) {
    case "doc":
      return (node.content ?? []).map((n) => nodeToMd(n)).join("");
    case "paragraph":
      return (node.content ? inlineToMd(node.content) : "") + "\n\n";
    case "heading":
      return (
        "#".repeat((node.attrs?.level as number) ?? 1) +
        " " +
        inlineToMd(node.content) +
        "\n\n"
      );
    case "blockquote":
      return (
        (node.content ?? [])
          .map((n) => "> " + nodeToMd(n).trimEnd())
          .join("\n") + "\n\n"
      );
    case "bulletList":
      return (
        (node.content ?? [])
          .map(
            (item) =>
              "  ".repeat(depth) +
              "- " +
              inlineToMd(item.content?.[0]?.content),
          )
          .join("\n") + "\n\n"
      );
    case "orderedList":
      return (
        (node.content ?? [])
          .map(
            (item, i) =>
              "  ".repeat(depth) +
              `${i + 1}. ` +
              inlineToMd(item.content?.[0]?.content),
          )
          .join("\n") + "\n\n"
      );
    case "codeBlock": {
      const lang = (node.attrs?.language as string) || "";
      const code = node.content?.[0]?.text ?? "";
      return "```" + lang + "\n" + code + "\n```\n\n";
    }
    case "image":
      return `![${node.attrs?.alt ?? ""}](${node.attrs?.src ?? ""})\n\n`;
    case "horizontalRule":
      return "---\n\n";
    default:
      return "";
  }
}
