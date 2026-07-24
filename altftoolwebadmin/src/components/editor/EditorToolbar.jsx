"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Braces,
  ChevronDown,
  Code,
  Command,
  Eraser,
  Eye,
  Film,
  Focus,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTodo,
  Maximize2,
  Minimize2,
  Minus,
  Quote,
  Redo2,
  Search,
  SquareCode,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Type,
  Underline as UnderlineIcon,
  Undo2,
  UnfoldVertical,
  Upload,
  SquarePlay as YoutubeIcon,
} from "lucide-react";
import { useAltfEditor } from "./EditorProvider.jsx";
import { FONT_SIZES } from "./extensions/FontSize";
import { LINE_HEIGHTS } from "./extensions/LineHeight";

/* ------------------------------ shared pieces ------------------------------ */

// NOTE: These hex values intentionally mirror the master.md brand palette
// (Teal/Cyan primaries plus supporting hues). They must remain literal hex —
// the editor serializes them into saved blog content, so CSS variables cannot
// be used here — and no importable central palette constant exists in the repo
// (packages/ui exposes only CSS token primitives and the brand name/mark).
// Keep these in sync with master.md if the brand palette ever changes.
export const TEXT_COLORS = [
  { name: "Teal", value: "#0d9488" },
  { name: "Cyan", value: "#0891b2" },
  { name: "Blue", value: "#2563eb" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Rose", value: "#e11d48" },
  { name: "Amber", value: "#b45309" },
  { name: "Green", value: "#15803d" },
  { name: "Slate", value: "#475569" },
];

export const HIGHLIGHT_COLORS = [
  { name: "Teal", value: "#ccfbf1" },
  { name: "Yellow", value: "#fef9c3" },
  { name: "Green", value: "#dcfce7" },
  { name: "Blue", value: "#dbeafe" },
  { name: "Pink", value: "#fce7f3" },
];

const FONT_FAMILIES = [
  { label: "Default", value: null },
  { label: "Geist (Sans)", value: "Geist, ui-sans-serif, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "'Geist Mono', ui-monospace, monospace" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
];

function Btn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`altft-tb__btn ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="altft-tb__divider" />;
}

function Dropdown({ label, title, children, width = 180 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <span className="altft-tb__dropdown" ref={ref}>
      <button
        type="button"
        title={title}
        aria-label={title}
        aria-expanded={open}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen(!open)}
        className="altft-tb__dropbtn"
      >
        {label}
        <ChevronDown size={11} aria-hidden="true" />
      </button>
      {open && (
        <span className="altft-tb__panel" style={{ minWidth: width }} onClick={() => setOpen(false)}>
          {children}
        </span>
      )}
    </span>
  );
}

function PanelItem({ onClick, active, children }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`altft-tb__panel-item ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}

function ColorGrid({ colors, onPick, onClear, clearLabel }) {
  return (
    <span className="altft-tb__colors">
      <span className="altft-tb__swatches">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            title={color.name}
            aria-label={color.name}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(color.value)}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </span>
      <button type="button" className="altft-tb__clear" onMouseDown={(e) => e.preventDefault()} onClick={onClear}>
        {clearLabel}
      </button>
    </span>
  );
}

/* --------------------------------- toolbar --------------------------------- */

/**
 * EditorToolbar — the professional, grouped, sticky toolbar. Every control
 * maps 1:1 to an editor command; state comes straight from the instance.
 */
export default function EditorToolbar({
  onOpenLink,
  onToggleSource,
  isSourceView,
  onToggleFullscreen,
  isFullscreen,
  onToggleFocusMode,
  focusMode,
  onOpenPalette,
  onToggleSeo,
  seoOpen,
}) {
  const { editor, readOnly, openImagePicker } = useAltfEditor();
  if (!editor) return null;

  const headingLabel = editor.isActive("heading")
    ? `H${[1, 2, 3, 4, 5, 6].find((level) => editor.isActive("heading", { level })) || ""}`
    : "Paragraph";

  const currentSize = editor.getAttributes("textStyle").fontSize;
  const sizeLabel = currentSize ? currentSize.replace("px", "") : "15";

  return (
    <div className="altft-tb" role="toolbar" aria-label="Editor toolbar">
      <div className="altft-tb__groups">
        {!isSourceView && !readOnly && (
          <>
            <Btn title="Undo (⌘Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <Undo2 size={15} />
            </Btn>
            <Btn title="Redo (⌘⇧Z)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <Redo2 size={15} />
            </Btn>

            <Divider />

            <Dropdown label={<span className="altft-tb__droplabel">{headingLabel}</span>} title="Text style" width={200}>
              <PanelItem active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
                Paragraph
              </PanelItem>
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <PanelItem
                  key={level}
                  active={editor.isActive("heading", { level })}
                  onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                >
                  <span style={{ fontSize: `${Math.max(12, 22 - level * 2)}px`, fontWeight: 700 }}>
                    Heading {level}
                  </span>
                </PanelItem>
              ))}
            </Dropdown>

            <Dropdown label={<Type size={14} />} title="Font family" width={190}>
              {FONT_FAMILIES.map((font) => (
                <PanelItem
                  key={font.label}
                  active={font.value ? editor.isActive("textStyle", { fontFamily: font.value }) : false}
                  onClick={() =>
                    font.value
                      ? editor.chain().focus().setFontFamily(font.value).run()
                      : editor.chain().focus().unsetFontFamily().run()
                  }
                >
                  <span style={{ fontFamily: font.value || "inherit" }}>{font.label}</span>
                </PanelItem>
              ))}
            </Dropdown>

            <Dropdown label={<span className="altft-tb__droplabel">{sizeLabel}</span>} title="Font size" width={90}>
              {FONT_SIZES.map((size) => (
                <PanelItem
                  key={size.value}
                  active={currentSize === size.value}
                  onClick={() => editor.chain().focus().setFontSize(size.value).run()}
                >
                  {size.label}
                </PanelItem>
              ))}
              <PanelItem onClick={() => editor.chain().focus().unsetFontSize().run()}>Reset</PanelItem>
            </Dropdown>

            <Dropdown label={<UnfoldVertical size={14} />} title="Line height" width={90}>
              {LINE_HEIGHTS.map((height) => (
                <PanelItem key={height} onClick={() => editor.chain().focus().setLineHeight(height).run()}>
                  {height}
                </PanelItem>
              ))}
              <PanelItem onClick={() => editor.chain().focus().unsetLineHeight().run()}>Reset</PanelItem>
            </Dropdown>

            <Divider />

            <Btn title="Bold (⌘B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold size={15} />
            </Btn>
            <Btn title="Italic (⌘I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic size={15} />
            </Btn>
            <Btn title="Underline (⌘U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon size={15} />
            </Btn>
            <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
              <Strikethrough size={15} />
            </Btn>
            <Btn title="Inline code (⌘E)" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
              <Code size={15} />
            </Btn>
            <Btn title="Superscript" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
              <SuperscriptIcon size={15} />
            </Btn>
            <Btn title="Subscript" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}>
              <SubscriptIcon size={15} />
            </Btn>

            <Dropdown label={<Baseline size={14} />} title="Text colour" width={170}>
              <ColorGrid
                colors={TEXT_COLORS}
                onPick={(color) => editor.chain().focus().setColor(color).run()}
                onClear={() => editor.chain().focus().unsetColor().run()}
                clearLabel="Remove colour"
              />
            </Dropdown>
            <Dropdown label={<Highlighter size={14} />} title="Highlight" width={170}>
              <ColorGrid
                colors={HIGHLIGHT_COLORS}
                onPick={(color) => editor.chain().focus().setHighlight({ color }).run()}
                onClear={() => editor.chain().focus().unsetHighlight().run()}
                clearLabel="Remove highlight"
              />
            </Dropdown>

            <Divider />

            <Dropdown
              label={
                editor.isActive({ textAlign: "center" }) ? (
                  <AlignCenter size={14} />
                ) : editor.isActive({ textAlign: "right" }) ? (
                  <AlignRight size={14} />
                ) : editor.isActive({ textAlign: "justify" }) ? (
                  <AlignJustify size={14} />
                ) : (
                  <AlignLeft size={14} />
                )
              }
              title="Text alignment"
              width={140}
            >
              {[
                ["left", AlignLeft, "Left"],
                ["center", AlignCenter, "Center"],
                ["right", AlignRight, "Right"],
                ["justify", AlignJustify, "Justify"],
              ].map(([align, Icon, label]) => (
                <PanelItem
                  key={align}
                  active={editor.isActive({ textAlign: align })}
                  onClick={() => editor.chain().focus().setTextAlign(align).run()}
                >
                  <Icon size={13} /> {label}
                </PanelItem>
              ))}
            </Dropdown>

            <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <List size={15} />
            </Btn>
            <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered size={15} />
            </Btn>
            <Btn title="Task list" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
              <ListTodo size={15} />
            </Btn>
            <Btn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote size={15} />
            </Btn>
            <Btn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
              <SquareCode size={15} />
            </Btn>
            <Btn title="Divider (horizontal rule)" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus size={15} />
            </Btn>

            <Divider />

            <Btn title="Add / edit link (⌘K in selection)" active={editor.isActive("link")} onClick={onOpenLink}>
              <LinkIcon size={15} />
            </Btn>
            <Btn title="Upload image (base64)" onClick={openImagePicker}>
              <Upload size={15} />
            </Btn>
            <Btn
              title="Image from URL"
              onClick={() => {
                const url = window.prompt("Image URL:");
                if (url) editor.chain().focus().setImage({ src: url }).run();
              }}
            >
              <ImageIcon size={15} />
            </Btn>
            <Btn
              title="YouTube embed"
              onClick={() => {
                const url = window.prompt("YouTube URL:");
                if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
              }}
            >
              <YoutubeIcon size={15} />
            </Btn>
            <Btn
              title="Video (Firebase / MP4 URL)"
              onClick={() => {
                const url = window.prompt("Video URL (direct Firebase Storage / MP4 link):");
                if (url) editor.chain().focus().setFirebaseVideo(url).run();
              }}
            >
              <Film size={15} />
            </Btn>
            <Btn
              title="Insert table"
              active={editor.isActive("table")}
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
              <TableIcon size={15} />
            </Btn>

            <Divider />

            <Btn title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
              <Eraser size={15} />
            </Btn>
            <Btn title="Command palette (⌘K)" onClick={onOpenPalette}>
              <Command size={15} />
            </Btn>
          </>
        )}
      </div>

      <div className="altft-tb__right">
        <Btn title={seoOpen ? "Hide SEO check" : "SEO check"} active={seoOpen} onClick={onToggleSeo}>
          <Search size={14} />
        </Btn>
        <Btn title={focusMode ? "Exit focus mode" : "Focus mode"} active={focusMode} onClick={onToggleFocusMode}>
          <Focus size={14} />
        </Btn>
        <button
          type="button"
          onClick={onToggleSource}
          className={`altft-tb__mode ${isSourceView ? "is-active" : ""}`}
        >
          {isSourceView ? <Eye size={13} /> : <Braces size={13} />}
          {isSourceView ? "Visual Editor" : "HTML Source"}
        </button>
        <Btn title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"} onClick={onToggleFullscreen}>
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </Btn>
      </div>
    </div>
  );
}
