"use client";

import {
  Code,
  Film,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Pilcrow,
  Quote,
  SquareCode,
  Table as TableIcon,
  SquarePlay,
} from "lucide-react";

/**
 * EditorCommands — single command registry shared by the slash menu,
 * command palette, and floating menu. Register a new command here and it
 * appears everywhere ("easy extension registration").
 */

const COMMANDS = [
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Plain body text",
    icon: Pilcrow,
    keywords: ["text", "body", "p"],
    group: "Basic",
    run: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: "h1",
    label: "Heading 1",
    description: "Page title",
    icon: Heading1,
    keywords: ["h1", "title", "heading"],
    group: "Basic",
    run: (editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
  },
  {
    id: "h2",
    label: "Heading 2",
    description: "Section heading",
    icon: Heading2,
    keywords: ["h2", "section", "heading"],
    group: "Basic",
    run: (editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
  },
  {
    id: "h3",
    label: "Heading 3",
    description: "Sub-section heading",
    icon: Heading3,
    keywords: ["h3", "heading"],
    group: "Basic",
    run: (editor) => editor.chain().focus().setHeading({ level: 3 }).run(),
  },
  {
    id: "h4",
    label: "Heading 4",
    description: "Small heading",
    icon: Heading4,
    keywords: ["h4", "heading"],
    group: "Basic",
    run: (editor) => editor.chain().focus().setHeading({ level: 4 }).run(),
  },
  {
    id: "bullet",
    label: "Bullet List",
    description: "Unordered list",
    icon: List,
    keywords: ["ul", "list", "bullet"],
    group: "Lists",
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: "ordered",
    label: "Numbered List",
    description: "Ordered list",
    icon: ListOrdered,
    keywords: ["ol", "list", "number"],
    group: "Lists",
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "task",
    label: "Task List",
    description: "Checklist with checkboxes",
    icon: ListTodo,
    keywords: ["todo", "task", "checklist", "checkbox"],
    group: "Lists",
    run: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    id: "quote",
    label: "Blockquote",
    description: "Quoted text",
    icon: Quote,
    keywords: ["quote", "blockquote", "cite"],
    group: "Blocks",
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: "codeblock",
    label: "Code Block",
    description: "Multi-line code",
    icon: SquareCode,
    keywords: ["code", "pre", "snippet"],
    group: "Blocks",
    run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: "hr",
    label: "Divider",
    description: "Horizontal rule",
    icon: Minus,
    keywords: ["hr", "divider", "rule", "separator", "line"],
    group: "Blocks",
    run: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: "table",
    label: "Table",
    description: "3×3 table with header row",
    icon: TableIcon,
    keywords: ["table", "grid", "rows", "columns"],
    group: "Blocks",
    run: (editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: "image",
    label: "Image",
    description: "Upload from your device",
    icon: ImageIcon,
    keywords: ["image", "photo", "picture", "upload"],
    group: "Media",
    run: (editor) => {
      editor.commands.focus();
      window.dispatchEvent(new CustomEvent("altft-editor:pick-image"));
    },
  },
  {
    id: "youtube",
    label: "YouTube",
    description: "Embed a YouTube video",
    icon: SquarePlay,
    keywords: ["youtube", "yt", "video", "embed"],
    group: "Media",
    run: (editor) => {
      const url = window.prompt("YouTube URL:");
      if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
    },
  },
  {
    id: "video",
    label: "Video (MP4 / Firebase)",
    description: "Embed a direct video URL",
    icon: Film,
    keywords: ["video", "mp4", "firebase", "media"],
    group: "Media",
    run: (editor) => {
      const url = window.prompt("Video URL (direct Firebase Storage / MP4 link):");
      if (url) editor.chain().focus().setFirebaseVideo(url).run();
    },
  },
  {
    id: "inlinecode",
    label: "Inline Code",
    description: "Monospace inline text",
    icon: Code,
    keywords: ["code", "inline", "mono"],
    group: "Blocks",
    run: (editor) => editor.chain().focus().toggleCode().run(),
  },
];

export function getSlashCommands() {
  return COMMANDS;
}

export function getPaletteCommands() {
  return COMMANDS;
}

/** Register an extra command at runtime (AI actions, custom blocks, …). */
export function registerCommand(command) {
  if (!command?.id || COMMANDS.some((existing) => existing.id === command.id)) return;
  COMMANDS.push(command);
}

export default COMMANDS;
