"use client";

import React from "react";
import { BubbleMenu } from "@tiptap/react";
import {
  Bold,
  Code,
  ExternalLink,
  Highlighter,
  Italic,
  Link as LinkIcon,
  Link2Off,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useAltfEditor } from "./EditorProvider.jsx";

function BubbleButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`altft-bubble__button ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}

/**
 * EditorBubbleMenu — floating formatting bar over any text selection.
 * When the selection is inside a link it switches to link actions.
 */
export default function EditorBubbleMenu({ onEditLink }) {
  const { editor, readOnly } = useAltfEditor();
  if (!editor || readOnly) return null;

  const inLink = editor.isActive("link");

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 120, maxWidth: "none" }}
      shouldShow={({ editor: instance, state }) => {
        if (!instance.isEditable) return false;
        if (state.selection.empty) return false;
        if (instance.isActive("image") || instance.isActive("firebaseVideo")) return false;
        return true;
      }}
    >
      <div className="altft-bubble" role="toolbar" aria-label="Text formatting">
        <BubbleButton title="Bold (⌘B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </BubbleButton>
        <BubbleButton title="Italic (⌘I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </BubbleButton>
        <BubbleButton title="Underline (⌘U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={14} />
        </BubbleButton>
        <BubbleButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={14} />
        </BubbleButton>
        <BubbleButton title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={14} />
        </BubbleButton>
        <BubbleButton title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef9c3" }).run()}>
          <Highlighter size={14} />
        </BubbleButton>

        <span className="altft-bubble__divider" aria-hidden="true" />

        <BubbleButton title={inLink ? "Edit link" : "Add link"} active={inLink} onClick={onEditLink}>
          <LinkIcon size={14} />
        </BubbleButton>
        {inLink && (
          <>
            <BubbleButton title="Remove link" onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}>
              <Link2Off size={14} />
            </BubbleButton>
            <BubbleButton
              title="Open link in new tab"
              onClick={() => {
                const href = editor.getAttributes("link").href;
                if (href) window.open(href, "_blank", "noopener");
              }}
            >
              <ExternalLink size={14} />
            </BubbleButton>
          </>
        )}
      </div>
    </BubbleMenu>
  );
}
