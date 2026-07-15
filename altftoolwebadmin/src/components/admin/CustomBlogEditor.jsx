"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import { FirebaseVideo } from "./editor/VideoExtension";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Eye,
  Terminal,
  Maximize2,
  Minimize2,
  ChevronDown,
  Trash2,
  Plus,
  Video,
} from "lucide-react";

export default function CustomBlogEditor({
  value,
  onChange,
  placeholder = "Start writing your article here...",
}) {
  const [isCodeView, setIsCodeView] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value || "");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "blog-link",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Highlight.configure({ multicolor: true }),
      FirebaseVideo,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "blog-table border-collapse w-full my-4",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      onChange?.(html);
    },
  });

  // Sync external modifications to the local state
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
      setHtmlContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const toggleCodeView = () => {
    if (isCodeView) {
      // Sync HTML text edits back to visual editor
      editor.commands.setContent(htmlContent);
    } else {
      setHtmlContent(editor.getHTML());
    }
    setIsCodeView(!isCodeView);
  };

  const addImageLink = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleLocalImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset input
  };

  const addVideoLink = () => {
    const url = window.prompt("Enter Firebase Storage Video URL:");
    if (url) {
      editor.chain().focus().insertContent(`<video src="${url}"></video>`).run();
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  // Button class helpers
  const activeBtnClass =
    "p-2 rounded-lg transition bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)] font-semibold";
  const inactiveBtnClass =
    "p-2 rounded-lg transition hover:bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]";

  return (
    <div
      className={`flex flex-col border border-[var(--border)] bg-[var(--surface)] rounded-xl overflow-hidden transition-all duration-200 ${
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "min-h-[500px]"
      }`}
    >
      {/* Hidden local image input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLocalImage}
        accept="image/*"
        className="hidden"
      />

      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)]/50 p-2 gap-2 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-0.5">
          {!isCodeView && (
            <>
              {/* History operations */}
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className={inactiveBtnClass}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className={inactiveBtnClass}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </button>

              <div className="w-px h-6 bg-[var(--border)] mx-1" />

              {/* Character formatting */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? activeBtnClass : inactiveBtnClass}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? activeBtnClass : inactiveBtnClass}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive("underline") ? activeBtnClass : inactiveBtnClass}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive("strike") ? activeBtnClass : inactiveBtnClass}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={editor.isActive("code") ? activeBtnClass : inactiveBtnClass}
                title="Inline Code"
              >
                <Code className="h-4 w-4" />
              </button>

              <div className="w-px h-6 bg-[var(--border)] mx-1" />

              {/* Structure */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive("heading", { level: 1 }) ? activeBtnClass : inactiveBtnClass}
                title="H1"
              >
                <Heading1 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive("heading", { level: 2 }) ? activeBtnClass : inactiveBtnClass}
                title="H2"
              >
                <Heading2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive("heading", { level: 3 }) ? activeBtnClass : inactiveBtnClass}
                title="H3"
              >
                <Heading3 className="h-4 w-4" />
              </button>

              <div className="w-px h-6 bg-[var(--border)] mx-1" />

              {/* Lists and Quotes */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive("bulletList") ? activeBtnClass : inactiveBtnClass}
                title="Bulleted List"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive("orderedList") ? activeBtnClass : inactiveBtnClass}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive("blockquote") ? activeBtnClass : inactiveBtnClass}
                title="Blockquote"
              >
                <Quote className="h-4 w-4" />
              </button>

              <div className="w-px h-6 bg-[var(--border)] mx-1" />

              {/* Link Insert */}
              <button
                type="button"
                onClick={addLink}
                className={editor.isActive("link") ? activeBtnClass : inactiveBtnClass}
                title="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>

              {/* Local Image Upload / URL Image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={inactiveBtnClass}
                title="Upload Local Image"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={addImageLink}
                className="px-2.5 py-1 text-xs font-semibold rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition"
                title="Insert Image by URL"
              >
                Img URL
              </button>

              {/* Direct Firebase Video Embed */}
              <button
                type="button"
                onClick={addVideoLink}
                className={inactiveBtnClass}
                title="Insert Firebase Video URL"
              >
                <Video className="h-4 w-4" />
              </button>

              <div className="w-px h-6 bg-[var(--border)] mx-1" />

              {/* Table controls */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTableMenu(!showTableMenu)}
                  className={`flex items-center gap-1 ${
                    editor.isActive("table") ? activeBtnClass : inactiveBtnClass
                  }`}
                  title="Table Operations"
                >
                  <TableIcon className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </button>

                {showTableMenu && (
                  <div className="absolute left-0 mt-1.5 w-48 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg py-1 z-20 text-xs text-[var(--foreground)]">
                    <button
                      type="button"
                      onClick={() => {
                        editor
                          .chain()
                          .focus()
                          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                          .run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[var(--surface-soft)] flex items-center gap-2"
                    >
                      <Plus className="h-3 w-3" /> Insert Table (3x3)
                    </button>
                    {editor.isActive("table") && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            editor.chain().focus().addRowAfter().run();
                            setShowTableMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--surface-soft)]"
                        >
                          Add Row After
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            editor.chain().focus().addColumnAfter().run();
                            setShowTableMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--surface-soft)]"
                        >
                          Add Column After
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            editor.chain().focus().deleteRow().run();
                            setShowTableMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--surface-soft)] text-red-500"
                        >
                          Delete Row
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            editor.chain().focus().deleteColumn().run();
                            setShowTableMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--surface-soft)] text-red-500"
                        >
                          Delete Column
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            editor.chain().focus().deleteTable().run();
                            setShowTableMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--surface-soft)] text-red-500 flex items-center gap-2 border-t border-[var(--border)] mt-1 pt-2"
                        >
                          <Trash2 className="h-3 w-3" /> Delete Table
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Toggle code view */}
          <button
            type="button"
            onClick={toggleCodeView}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              isCodeView
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {isCodeView ? <Eye className="h-3.5 w-3.5" /> : <Terminal className="h-3.5 w-3.5" />}
            {isCodeView ? "Visual view" : "HTML source"}
          </button>

          {/* Fullscreen mode */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="flex-1 min-h-[400px] overflow-y-auto bg-[var(--surface)]">
        {isCodeView ? (
          <textarea
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              onChange?.(e.target.value);
            }}
            spellCheck={false}
            className="w-full h-full min-h-[400px] p-6 font-mono text-[13px] leading-6 bg-neutral-950 text-neutral-100 border-none outline-none resize-none"
            placeholder="Type or edit HTML code source directly..."
          />
        ) : (
          <div className="p-6 prose dark:prose-invert prose-teal max-w-none focus:outline-none">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
}
