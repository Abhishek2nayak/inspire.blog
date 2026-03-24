"use client";

import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import { createLowlight } from "lowlight";
/* ── Language imports (Hashnode-style curated list) ── */
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import yaml from "highlight.js/lib/languages/yaml";
import markdownLang from "highlight.js/lib/languages/markdown";
import sql from "highlight.js/lib/languages/sql";
import kotlin from "highlight.js/lib/languages/kotlin";
import swift from "highlight.js/lib/languages/swift";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import graphql from "highlight.js/lib/languages/graphql";
import c from "highlight.js/lib/languages/c";
import csharp from "highlight.js/lib/languages/csharp";
import scala from "highlight.js/lib/languages/scala";

const lowlight = createLowlight();
lowlight.register({
  javascript, typescript, python, bash, xml, css, json, go, rust,
  java, cpp, php, ruby, yaml, markdown: markdownLang, sql, kotlin,
  swift, dockerfile, graphql, c, csharp, scala,
});
lowlight.registerAlias({ xml: ["html"] });
lowlight.registerAlias({ bash: ["shell"] });
lowlight.registerAlias({ csharp: ["cs"] });

/* ── Language list for the selector ── */
const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash / Shell" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
  { value: "scala", label: "Scala" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "graphql", label: "GraphQL" },
  { value: "dockerfile", label: "Dockerfile" },
];

/* ── Custom CodeBlock NodeView ── */
function CodeBlockView({ node, updateAttributes }: NodeViewProps) {
  const language: string = node.attrs.language || "plaintext";
  return (
    <NodeViewWrapper className="relative my-4 overflow-hidden rounded-xl border border-border">
      {/* Language selector header */}
      <div
        className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2"
        contentEditable={false}
      >
        <select
          value={language}
          onChange={(e) => updateAttributes({ language: e.target.value })}
          className="cursor-pointer appearance-none bg-transparent text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground/50">code</span>
      </div>
      {/* Code content */}
      <pre className="overflow-x-auto bg-muted/20 p-4 text-sm leading-relaxed">
        {/* NodeViewContent renders the editable code; styled as mono */}
        <NodeViewContent className="font-mono" />
      </pre>
    </NodeViewWrapper>
  );
}

/* ── Slash command definitions ── */
import { useState, useRef, useCallback, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Code,
  ImageIcon,
  X,
  Loader2,
  Tag,
  ChevronDown,
  ChevronUp,
  FileCode,
  Copy,
  ClipboardCheck,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Type,
  Check,
  Upload,
} from "lucide-react";

const SLASH_COMMANDS = [
  {
    id: "text",
    label: "Text",
    desc: "Just start writing with plain text",
    icon: Type,
    action: (editor: ReturnType<typeof useEditor>) =>
      editor?.chain().focus().clearNodes().setParagraph().run(),
  },
  {
    id: "h1",
    label: "Heading 1",
    desc: "Big section heading",
    icon: Heading1,
    action: (editor: ReturnType<typeof useEditor>) =>
      editor?.chain().focus().clearNodes().setHeading({ level: 1 }).run(),
  },
  {
    id: "h2",
    label: "Heading 2",
    desc: "Medium section heading",
    icon: Heading2,
    action: (editor: ReturnType<typeof useEditor>) =>
      editor?.chain().focus().clearNodes().setHeading({ level: 2 }).run(),
  },
  {
    id: "h3",
    label: "Heading 3",
    desc: "Small section heading",
    icon: Heading3,
    action: (editor: ReturnType<typeof useEditor>) =>
      editor?.chain().focus().clearNodes().setHeading({ level: 3 }).run(),
  },
  {
    id: "ul",
    label: "Bullet List",
    desc: "Create a simple bulleted list",
    icon: List,
    action: (editor: ReturnType<typeof useEditor>) =>
      editor?.chain().focus().clearNodes().toggleBulletList().run(),
  },
  {
    id: "ol",
    label: "Numbered List",
    desc: "Create a numbered list",
    icon: ListOrdered,
    action: (editor: ReturnType<typeof useEditor>) =>
      editor?.chain().focus().clearNodes().toggleOrderedList().run(),
  },
  {
    id: "quote",
    label: "Quote",
    desc: "Capture a quote or highlight",
    icon: Quote,
    action: (editor: ReturnType<typeof useEditor>) =>
      editor?.chain().focus().clearNodes().setBlockquote().run(),
  },
  {
    id: "code",
    label: "Code Block",
    desc: "Capture a code snippet with syntax highlighting",
    icon: Code2,
    action: (editor: ReturnType<typeof useEditor>) =>
      editor?.chain().focus().clearNodes().setCodeBlock().run(),
  },
  {
    id: "image",
    label: "Image",
    desc: "Embed an image by URL or upload",
    icon: ImageIcon,
    action: null, // handled specially — opens image dialog
  },
  {
    id: "divider",
    label: "Divider",
    desc: "Visually divide sections",
    icon: Minus,
    action: (editor: ReturnType<typeof useEditor>) =>
      editor?.chain().focus().setHorizontalRule().run(),
  },
] as const;

type SlashCommand = (typeof SLASH_COMMANDS)[number];

const DRAFT_KEY = "inspire_draft_new";

/* ── Simple markdown → HTML converter ── */
function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function applyInline(t: string): string {
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  t = t.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__([^_\n]+)__/g, "<strong>$1</strong>");
  t = t.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  t = t.replace(/_([^_\n]+)_/g, "<em>$1</em>");
  t = t.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  return t;
}
function markdownToHtml(md: string): string {
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
      while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
      out.push(`<pre><code class="language-${lang}">${escHtml(code.join("\n"))}</code></pre>`);
      i++; continue;
    }
    // Heading
    const hm = line.match(/^(#{1,6})\s+(.+)/);
    if (hm) { const l = hm[1].length; out.push(`<h${l}>${applyInline(hm[2])}</h${l}>`); i++; continue; }
    // HR
    if (/^---+$/.test(line.trim())) { out.push("<hr>"); i++; continue; }
    // Blockquote
    if (line.startsWith("> ")) {
      const ql: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) { ql.push(lines[i].slice(2)); i++; }
      out.push(`<blockquote><p>${applyInline(ql.join(" "))}</p></blockquote>`);
      continue;
    }
    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${applyInline(lines[i].replace(/^[-*]\s+/, ""))}</li>`); i++;
      }
      out.push(`<ul>${items.join("")}</ul>`); continue;
    }
    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${applyInline(lines[i].replace(/^\d+\.\s+/, ""))}</li>`); i++;
      }
      out.push(`<ol>${items.join("")}</ol>`); continue;
    }
    // Empty
    if (line.trim() === "") { i++; continue; }
    // Paragraph
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" &&
      !/^#{1,6}\s/.test(lines[i]) && !lines[i].startsWith("```") &&
      !lines[i].startsWith("> ") && !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
      para.push(lines[i]); i++;
    }
    if (para.length) out.push(`<p>${applyInline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

/* ── TipTap JSON → Markdown serialiser ── */
type TipNode = { type: string; attrs?: Record<string, unknown>; content?: TipNode[]; text?: string; marks?: { type: string; attrs?: Record<string, unknown> }[] };

function inlineToMd(nodes: TipNode[] | undefined): string {
  if (!nodes) return "";
  return nodes.map((n) => {
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
  }).join("");
}

function nodeToMd(node: TipNode, depth = 0): string {
  switch (node.type) {
    case "doc": return (node.content ?? []).map((n) => nodeToMd(n)).join("");
    case "paragraph": return (node.content ? inlineToMd(node.content) : "") + "\n\n";
    case "heading": return "#".repeat((node.attrs?.level as number) ?? 1) + " " + inlineToMd(node.content) + "\n\n";
    case "blockquote": return (node.content ?? []).map((n) => "> " + nodeToMd(n).trimEnd()).join("\n") + "\n\n";
    case "bulletList": return (node.content ?? []).map((item) => "  ".repeat(depth) + "- " + inlineToMd(item.content?.[0]?.content)).join("\n") + "\n\n";
    case "orderedList": return (node.content ?? []).map((item, i) => "  ".repeat(depth) + `${i + 1}. ` + inlineToMd(item.content?.[0]?.content)).join("\n") + "\n\n";
    case "codeBlock": {
      const lang = (node.attrs?.language as string) || "";
      const code = node.content?.[0]?.text ?? "";
      return "```" + lang + "\n" + code + "\n```\n\n";
    }
    case "image": return `![${node.attrs?.alt ?? ""}](${node.attrs?.src ?? ""})\n\n`;
    case "horizontalRule": return "---\n\n";
    default: return "";
  }
}

interface BlogEditorProps {
  initialTitle?: string;
  initialSubtitle?: string;
  initialContent?: string;
  initialContentMd?: string;
  postId?: string; // if editing an existing post, skip draft restore
  onSave: (data: {
    title: string;
    subtitle: string;
    content: string;
    contentMd: string;
    coverImage?: string;
    tags: string[];
    published: boolean;
    metaTitle: string;
    metaDesc: string;
    canonicalUrl: string;
  }) => void;
  saving?: boolean;
}

/* ── Main component ── */
export default function BlogEditor({
  initialTitle = "",
  initialSubtitle = "",
  initialContent = "",
  postId,
  onSave,
  saving,
}: BlogEditorProps) {
  const { toast } = useToast();

  /* Meta state */
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [coverImage, setCoverImage] = useState<string | undefined>();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [showSeo, setShowSeo] = useState(false);

  /* Draft restore state */
  const [draftBanner, setDraftBanner] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Markdown source view */
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [markdownText, setMarkdownText] = useState("");
  const [mdCopied, setMdCopied] = useState(false);
  const mdSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Slash command state */
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const slashMenuRef = useRef<HTMLDivElement>(null);

  /* Refs so DOM capture listener avoids stale closures */
  const slashOpenRef = useRef(false);
  const slashIndexRef = useRef(0);
  const filteredCommandsRef = useRef<readonly SlashCommand[]>([]);
  const runSlashCommandRef = useRef<(cmd: SlashCommand) => void>(() => {});

  /* Bubble menu link state */
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  /* Image dialog state */
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageInputUrl, setImageInputUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  /* ── CodeBlock extension with custom NodeView ── */
  const CodeBlockWithLang = CodeBlockLowlight.configure({ lowlight }).extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockView);
    },
  });

  /* ── Editor setup ── */
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return "Heading";
          return "Write something, or type '/' for commands…";
        },
      }),
      Image.configure({ inline: false }),
      Underline,
      CodeBlockWithLang,
      Link.configure({ openOnClick: false }),
    ],
    content: initialContent || "",
    onUpdate({ editor }) {
      const { $from, empty } = editor.state.selection;
      if (!empty) { setSlashOpen(false); return; }

      const text = $from.parent.textContent.slice(0, $from.parentOffset);
      const match = text.match(/^\/(\w*)$/);

      if (match) {
        const query = match[1];
        setSlashQuery(query);
        setSlashIndex(0);
        try {
          const coords = editor.view.coordsAtPos($from.pos);
          setSlashPos({ top: coords.bottom + 6, left: coords.left });
        } catch { /* ignore */ }
        setSlashOpen(true);
      } else {
        setSlashOpen(false);
      }
      // Auto-save draft
      if (!postId) triggerAutoSave(title, subtitle, editor.getJSON() as unknown as string);
    },
  });

  /* Markdown open/close/sync — defined after editor */
  const openMarkdown = useCallback(() => {
    if (!editor) return;
    setMarkdownText(nodeToMd(editor.getJSON() as TipNode).trimEnd());
    setShowMarkdown(true);
  }, [editor]);

  const closeMarkdown = useCallback(() => {
    if (editor && markdownText.trim()) {
      editor.commands.setContent(markdownToHtml(markdownText));
    }
    setShowMarkdown(false);
  }, [editor, markdownText]);

  const handleMarkdownChange = useCallback((val: string) => {
    setMarkdownText(val);
    if (mdSyncTimer.current) clearTimeout(mdSyncTimer.current);
    mdSyncTimer.current = setTimeout(() => {
      if (editor && val.trim()) {
        editor.commands.setContent(markdownToHtml(val));
      }
    }, 500);
  }, [editor]);

  /* Close slash menu when clicking outside */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
        setSlashOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Restore draft on mount (new posts only) */
  useEffect(() => {
    if (postId || initialContent) return; // editing existing — skip
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title || draft.subtitle || draft.content) setDraftBanner(true);
      }
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const draft = JSON.parse(saved);
      if (draft.title) setTitle(draft.title);
      if (draft.subtitle) setSubtitle(draft.subtitle);
      if (draft.content && editor) editor.commands.setContent(draft.content);
    } catch { /* ignore */ }
    setDraftBanner(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftBanner(false);
  };

  /* Auto-save to localStorage (debounced 2s) */
  const triggerAutoSave = useCallback((t: string, s: string, content: string) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: t, subtitle: s, content })); }
      catch { /* ignore */ }
    }, 2000);
  }, []);

  /* Filtered slash commands (derived) */
  const filteredCommands = slashOpen
    ? SLASH_COMMANDS.filter(
        (c) =>
          !slashQuery ||
          c.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
          c.desc.toLowerCase().includes(slashQuery.toLowerCase())
      )
    : ([] as readonly SlashCommand[]);

  /* Execute slash command */
  const runSlashCommand = useCallback(
    (cmd: SlashCommand) => {
      if (!editor) return;
      const { $from } = editor.state.selection;
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      const matchLen = textBefore.match(/^\/(\w*)$/)?.[0]?.length ?? 0;
      if (matchLen > 0) {
        editor.chain().focus().deleteRange({ from: $from.pos - matchLen, to: $from.pos }).run();
      }
      setSlashOpen(false);
      if (cmd.id === "image") {
        setImageInputUrl("");
        setImageAlt("");
        setImageDialogOpen(true);
        return;
      }
      cmd.action?.(editor);
    },
    [editor]
  );

  /* Keep refs in sync */
  useEffect(() => { slashOpenRef.current = slashOpen; }, [slashOpen]);
  useEffect(() => { slashIndexRef.current = slashIndex; }, [slashIndex]);
  useEffect(() => { filteredCommandsRef.current = filteredCommands; }, [filteredCommands]);
  useEffect(() => { runSlashCommandRef.current = runSlashCommand; }, [runSlashCommand]);

  /* DOM capture listener — fires BEFORE TipTap processes the key */
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!slashOpenRef.current) return;
      const cmds = filteredCommandsRef.current;
      if (cmds.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setSlashIndex((i) => Math.min(i + 1, cmds.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setSlashIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        runSlashCommandRef.current(cmds[slashIndexRef.current]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setSlashOpen(false);
      }
    };

    dom.addEventListener("keydown", onKeyDown, { capture: true });
    return () => dom.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [editor]);

  /* Link handling */
  const applyLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkMode(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const openLinkMode = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes("link").href ?? "";
    setLinkUrl(existing);
    setLinkMode(true);
    setTimeout(() => linkInputRef.current?.focus(), 50);
  }, [editor]);

  /* Image insert from dialog */
  const insertImageFromUrl = useCallback(() => {
    if (!editor || !imageInputUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageInputUrl.trim(), alt: imageAlt || undefined }).run();
    setImageDialogOpen(false);
    setImageInputUrl("");
    setImageAlt("");
  }, [editor, imageInputUrl, imageAlt]);

  /* Image upload from dialog */
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const d = await res.json();
        editor?.chain().focus().setImage({ src: d.url }).run();
        setImageDialogOpen(false);
      } else {
        toast({ title: "Failed to upload image", variant: "destructive" });
      }
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  /* Cover image upload */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) { const d = await res.json(); setCoverImage(d.url); }
      else toast({ title: "Failed to upload image", variant: "destructive" });
    } catch { toast({ title: "Upload failed", variant: "destructive" }); }
    finally { setUploadingCover(false); e.target.value = ""; }
  };

  /* Tags */
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,/g, "");
      if (!tags.includes(tag) && tags.length < 10) setTags([...tags, tag]);
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  /* Save */
  const doSave = (published: boolean) => {
    if (!title.trim()) {
      toast({ title: "Add a title before saving", variant: "destructive" });
      return;
    }
    // Clear draft on intentional save
    if (!postId) {
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    }
    onSave({
      title,
      subtitle,
      content: editor?.getHTML() ?? "",
      contentMd: editor?.getText() ?? "",
      coverImage,
      tags,
      published,
      metaTitle,
      metaDesc,
      canonicalUrl,
    });
  };

  /* ── Render ── */
  return (
    <div className="w-full">
      {/* Cover image */}
      {coverImage ? (
        <div className="relative mb-8 overflow-hidden rounded-xl">
          <img src={coverImage} alt="Cover" className="h-52 w-full object-cover sm:h-64" />
          <button
            onClick={() => setCoverImage(undefined)}
            className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground">
          {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          {uploadingCover ? "Uploading…" : "Add cover image"}
          <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
        </label>
      )}

      {/* Draft restore banner */}
      {draftBanner && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <span>You have an unsaved draft. Restore it?</span>
          <div className="flex gap-2 ml-4">
            <button onClick={restoreDraft} className="font-medium underline underline-offset-2 hover:opacity-80">Restore</button>
            <button onClick={discardDraft} className="opacity-60 hover:opacity-100">Discard</button>
          </div>
        </div>
      )}

      {/* Title */}
      <TextareaAutosize
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (!postId) triggerAutoSave(e.target.value, subtitle, editor?.getJSON() as unknown as string ?? "");
        }}
        placeholder="Article title…"
        className="mb-2 w-full resize-none bg-transparent font-serif text-3xl font-bold leading-tight text-foreground placeholder:text-muted-foreground/30 focus:outline-none sm:text-4xl"
        maxRows={5}
      />

      {/* Subtitle */}
      <TextareaAutosize
        value={subtitle}
        onChange={(e) => {
          setSubtitle(e.target.value);
          if (!postId) triggerAutoSave(title, e.target.value, editor?.getJSON() as unknown as string ?? "");
        }}
        placeholder="Add a subtitle… (optional)"
        className="mb-4 w-full resize-none bg-transparent text-lg leading-snug text-muted-foreground placeholder:text-muted-foreground/30 focus:outline-none"
        maxRows={3}
      />

      {/* ── Editor mode toggle ── */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
          <button
            onClick={closeMarkdown}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all",
              !showMarkdown ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Type className="h-3 w-3" />
            Rich editor
          </button>
          <button
            onClick={openMarkdown}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all",
              showMarkdown ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileCode className="h-3 w-3" />
            Markdown
          </button>
        </div>
        {showMarkdown && (
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(markdownText);
              setMdCopied(true);
              setTimeout(() => setMdCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {mdCopied ? <ClipboardCheck className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {mdCopied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>

      <div className="mb-6 border-t border-border" />

      {/* ── Markdown editor ── */}
      {showMarkdown && (
        <textarea
          value={markdownText}
          onChange={(e) => handleMarkdownChange(e.target.value)}
          className="w-full min-h-[480px] resize-y rounded-xl border border-border bg-muted/20 p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="# Your article in Markdown…"
          spellCheck={false}
        />
      )}

      {/* ── TipTap editor wrapper ── */}
      <div className={cn("relative min-h-[480px]", showMarkdown && "hidden")}>
        {/* BubbleMenu */}
        {editor && (
          <BubbleMenu
            editor={editor}
            className="flex overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          >
            {linkMode ? (
              <div className="flex items-center gap-1 px-2 py-1">
                <LinkIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  ref={linkInputRef}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); applyLink(); }
                    if (e.key === "Escape") { setLinkMode(false); editor.chain().focus().run(); }
                  }}
                  placeholder="https://…"
                  className="w-52 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button onClick={applyLink} className="ml-1 rounded p-1 hover:bg-muted">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setLinkMode(false)} className="rounded p-1 hover:bg-muted">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <BubbleBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
                  <Bold className="h-3.5 w-3.5" />
                </BubbleBtn>
                <BubbleBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
                  <Italic className="h-3.5 w-3.5" />
                </BubbleBtn>
                <BubbleBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
                  <UnderlineIcon className="h-3.5 w-3.5" />
                </BubbleBtn>
                <BubbleBtn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
                  <Code className="h-3.5 w-3.5" />
                </BubbleBtn>
                <div className="my-1 w-px bg-border" />
                <BubbleBtn active={editor.isActive("link")} onClick={openLinkMode} title="Link">
                  <LinkIcon className="h-3.5 w-3.5" />
                </BubbleBtn>
                {editor.isActive("link") && (
                  <BubbleBtn active={false} onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link">
                    <X className="h-3.5 w-3.5" />
                  </BubbleBtn>
                )}
                <div className="my-1 w-px bg-border" />
                <BubbleBtn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="H1">
                  <Heading1 className="h-3.5 w-3.5" />
                </BubbleBtn>
                <BubbleBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2">
                  <Heading2 className="h-3.5 w-3.5" />
                </BubbleBtn>
              </>
            )}
          </BubbleMenu>
        )}

        {/* Editor content */}
        <EditorContent editor={editor} className="notion-editor" />

        {/* Slash command menu */}
        {slashOpen && filteredCommands.length > 0 && (
          <div
            ref={slashMenuRef}
            style={{ position: "fixed", top: slashPos.top, left: slashPos.left, zIndex: 9999 }}
            className="w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
          >
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Blocks
            </div>
            <div className="pb-1">
              {filteredCommands.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onMouseDown={(e) => { e.preventDefault(); runSlashCommand(cmd); }}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                    i === slashIndex ? "bg-muted text-foreground" : "text-foreground hover:bg-muted/60"
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                    <cmd.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{cmd.label}</div>
                    <div className="text-xs text-muted-foreground">{cmd.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Image Insert Dialog ── */}
      {imageDialogOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Insert Image</h3>
              <button onClick={() => setImageDialogOpen(false)} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* URL input */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Image URL</label>
              <div className="flex gap-2">
                <Input
                  value={imageInputUrl}
                  onChange={(e) => setImageInputUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                  onKeyDown={(e) => { if (e.key === "Enter") insertImageFromUrl(); }}
                  autoFocus
                />
                <Button onClick={insertImageFromUrl} disabled={!imageInputUrl.trim()} className="shrink-0">
                  Insert
                </Button>
              </div>
            </div>

            {/* Alt text */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Alt text (optional)</label>
              <Input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Describe the image…"
              />
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground">or upload</span>
              </div>
            </div>

            {/* File upload */}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
              {uploadingImage ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="h-4 w-4" /> Choose file</>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileUpload}
                disabled={uploadingImage}
              />
            </label>
          </div>
        </div>
      )}

      {/* ── Tags ── */}
      <div className="mt-8 rounded-xl border border-border bg-card px-4 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tags</p>
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-sm text-foreground">
              {t}
              <button onClick={() => setTags(tags.filter((x) => x !== t))} className="opacity-50 hover:opacity-100">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={tags.length < 10 ? "Add tags (Enter or comma)…" : "Max 10 tags"}
            disabled={tags.length >= 10}
            className="min-w-[140px] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* ── SEO panel ── */}
      <div className="mt-3 rounded-xl border border-border bg-card">
        <button
          onClick={() => setShowSeo(!showSeo)}
          className="flex w-full items-center gap-2 px-4 py-3.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {showSeo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="font-medium">SEO &amp; Settings</span>
        </button>
        {showSeo && (
          <div className="space-y-4 border-t border-border px-4 pb-4 pt-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Meta Title</label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Custom title for search engines" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Meta Description</label>
              <textarea
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                placeholder="Brief description (max 160 chars)"
                maxLength={160}
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">{metaDesc.length}/160</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Canonical URL</label>
              <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://original-source.com/article" />
            </div>
          </div>
        )}
      </div>

      {/* ── Publish actions ── */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => doSave(false)} disabled={saving}>
          Save draft
        </Button>
        <Button onClick={() => doSave(true)} disabled={saving} className="bg-foreground text-background hover:opacity-90">
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing…</>
          ) : (
            "Publish"
          )}
        </Button>
      </div>
    </div>
  );
}

/* ── Small helper: BubbleMenu button ── */
function BubbleBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        "flex h-8 w-8 items-center justify-center transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
