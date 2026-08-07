"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  PenTool,
} from "lucide-react";

// Declared at module scope (not inside EditorToolbar) so it keeps a stable
// component identity across renders. When it used to be defined inside
// EditorToolbar's function body, every keystroke in the editor triggered
// onUpdate -> setContent -> a re-render of EditorToolbar, which redefined
// ToolbarButton as a brand-new function reference each time -- React then
// tore down and remounted all 17 toolbar buttons (and their DOM nodes) on
// every character typed instead of just diffing their props.
const ToolbarButton = ({ onClick, isActive, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`p-2 rounded-md flex items-center justify-center transition-colors ${
      isActive
        ? "bg-(--primary)/20 text-(--primary)"
        : "text-(--muted-foreground) hover:bg-(--border) hover:text-(--foreground)"
    }`}
  >
    {children}
  </button>
);

const EditorToolbar = ({ editor }) => {
  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (!url) return;
    const alt = window.prompt(
      "Describe this image for screen reader users (alt text). Leave blank only if it's purely decorative:",
    );
    editor
      .chain()
      .focus()
      .setImage({ src: url, alt: alt ? alt.trim() : "" })
      .run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-(--border) bg-(--card)">
      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-(--border) mx-1" />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-(--border) mx-1" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-(--border) mx-1" />

      {/* Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-(--border) mx-1" />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        isActive={editor.isActive({ textAlign: "justify" })}
        title="Align Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-(--border) mx-1" />

      {/* Media */}
      <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="Add Link">
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} isActive={false} title="Add Image">
        <ImageIcon className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
};

const RichTextEditor = ({
  initialContent = "",
  onChange,
  readOnly = false,
  placeholder = "Start typing...",
}) => {
  const editor = useEditor({
    extensions: [
      // StarterKit v3 bundles its own default-configured Link (openOnClick:
      // true) and Underline extensions. Without disabling them here, TipTap
      // registers both the StarterKit copies and the ones configured below,
      // and the StarterKit copy's click handler can end up ahead of ours --
      // silently defeating openOnClick:false. Disabling them in StarterKit
      // keeps the Underline/Link instances below as the only ones registered.
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        // Presentational classes for links/images live here, scoped to the
        // in-app editing surface, instead of on the Link/Image extensions'
        // HTMLAttributes — those get baked into every <a>/<img> node and
        // would ship inside editor.getHTML(), the exact string this tool
        // hands off for copy/paste into an external CMS or database column.
        // Arbitrary app-only Tailwind classes (e.g. text-(--primary), which
        // only resolves against this app's own CSS variable) have no
        // business in that exported markup.
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[300px] p-6 text-(--foreground) [&_a]:text-(--primary) [&_a]:underline [&_a]:cursor-pointer [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  // useEditor() is called with no `deps` array, so TipTap never recreates the
  // editor instance — the `editable: !readOnly` option passed to useEditor()
  // above only takes effect at the very first mount. Toggling `readOnly`
  // afterwards must be pushed to the live editor explicitly via
  // setEditable(), otherwise the ProseMirror view stays editable forever.
  useEffect(() => {
    if (editor && editor.isEditable !== !readOnly) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  if (!editor) return null;

  return (
    <div className="rte-editor border border-(--border) rounded-xl overflow-hidden bg-(--card) shadow-sm focus-within:ring-2 focus-within:ring-(--primary)/30 transition-all">
      {!readOnly && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
      {/* @tiptap/extension-placeholder decorates the empty node with an
          `is-editor-empty` class and a `data-placeholder` attribute rather
          than a real `placeholder` DOM attribute (that only exists on
          <input>/<textarea>, never on the contenteditable <div> TipTap
          renders into), so the placeholder text has to be painted in via
          this ::before rule instead of a prop on EditorContent. */}
      <style jsx global>{`
        .rte-editor .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          color: var(--muted-foreground);
        }
      `}</style>
    </div>
  );
};

export default function RichDataEditor() {
  const [content, setContent] = useState("<h1>Welcome to the Rich Text Editor</h1><p>This is a powerful WYSIWYG editor built with TipTap. Try out the formatting tools above!</p>");
  const [readOnly, setReadOnly] = useState(false);

  return (
    <div className="min-h-screen bg-(--background) py-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-(--primary)/10 mb-2">
            <PenTool className="w-8 h-8 text-(--primary)" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-(--foreground) tracking-tight">
            Rich Text Editor
          </h1>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            A beautiful, fully-featured WYSIWYG editor. Format text, add media, and export clean HTML instantly.
          </p>
        </div>

        {/* Editor Section */}
        <div className="bg-(--card) border border-(--border) rounded-2xl overflow-hidden shadow-xs">
          <div className="p-6 border-b border-(--border) flex flex-wrap gap-4 items-center justify-between bg-(--muted)/20">
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">Editor</h2>
              <p className="text-sm text-(--muted-foreground)">Create and format your content</p>
            </div>
            <button
              onClick={() => setReadOnly(!readOnly)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                readOnly
                  ? "bg-(--primary) text-white hover:bg-(--primary)/90"
                  : "border border-(--border) text-(--foreground) hover:bg-(--border)/50"
              }`}
            >
              {readOnly ? "Edit Mode" : "Read-Only Mode"}
            </button>
          </div>
          <div className="p-6">
            <RichTextEditor
              initialContent={content}
              onChange={setContent}
              readOnly={readOnly}
              placeholder="Start writing your content here..."
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-(--card) border border-(--border) rounded-2xl overflow-hidden shadow-xs">
          <div className="p-6 border-b border-(--border) bg-(--muted)/20">
            <h2 className="text-xl font-semibold text-(--foreground)">HTML Output</h2>
            <p className="text-sm text-(--muted-foreground)">Live preview of the generated HTML</p>
          </div>
          <div className="p-6">
            <pre className="bg-(--background) text-(--foreground) p-6 rounded-xl overflow-x-auto text-sm border border-(--border)">
              <code>{content}</code>
            </pre>
          </div>
        </div>

        {/* Features Info */}
        <div className="bg-(--card) border border-(--border) rounded-2xl overflow-hidden shadow-xs">
          <div className="p-6 border-b border-(--border) bg-(--muted)/20">
            <h2 className="text-xl font-semibold text-(--foreground)">Features</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="font-semibold text-(--foreground) mb-3">Text Formatting</h3>
                <ul className="text-sm text-(--muted-foreground) space-y-2">
                  <li>• Bold, Italic, Underline, Strikethrough</li>
                  <li>• Headings (H1, H2, H3)</li>
                  <li>• Text Alignment (Left, Center, Right, Justify)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-(--foreground) mb-3">Content Blocks</h3>
                <ul className="text-sm text-(--muted-foreground) space-y-2">
                  <li>• Bullet & Ordered Lists</li>
                  <li>• Blockquotes</li>
                  <li>• Code Blocks</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-(--foreground) mb-3">Media</h3>
                <ul className="text-sm text-(--muted-foreground) space-y-2">
                  <li>• Insert Links</li>
                  <li>• Embed Images</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-(--foreground) mb-3">Modes</h3>
                <ul className="text-sm text-(--muted-foreground) space-y-2">
                  <li>• Edit Mode (full toolbar)</li>
                  <li>• Read-Only Mode (content only)</li>
                  <li>• Live HTML Export</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
