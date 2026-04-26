import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code2, ImageIcon, Minus } from "lucide-react";

export const EDITOR_LANGUAGES = [
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


export const SLASH_COMMANDS = [
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
