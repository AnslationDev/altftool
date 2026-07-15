"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ClipboardCopy,
  ClipboardPaste,
  Copy,
  MoveDown,
  MoveUp,
  Pilcrow,
  Scissors,
  Trash2,
} from "lucide-react";
import { useAltfEditor } from "./EditorProvider.jsx";

/**
 * EditorContextMenu — custom right-click menu inside the editing surface:
 * clipboard actions plus block operations (duplicate, move, delete,
 * convert to paragraph).
 */
export default function EditorContextMenu({ containerRef }) {
  const { editor, readOnly } = useAltfEditor();
  const [menu, setMenu] = useState(null); // {x, y}

  const close = useCallback(() => setMenu(null), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || readOnly) return undefined;

    const onContextMenu = (event) => {
      if (!event.target.closest(".ProseMirror")) return;
      event.preventDefault();
      setMenu({
        x: Math.min(event.clientX, window.innerWidth - 230),
        y: Math.min(event.clientY, window.innerHeight - 300),
      });
    };

    container.addEventListener("contextmenu", onContextMenu);
    return () => container.removeEventListener("contextmenu", onContextMenu);
  }, [containerRef, readOnly]);

  useEffect(() => {
    if (!menu) return undefined;
    const off = () => close();
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", off);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", off, true);
    return () => {
      document.removeEventListener("mousedown", off);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", off, true);
    };
  }, [menu, close]);

  if (!editor || !menu) return null;

  const moveBlock = (direction) => {
    const { state } = editor;
    const { $from } = state.selection;
    const depth = 1;
    const index = $from.index(depth - 1);
    const parent = $from.node(depth - 1);
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= parent.childCount) return;

    const node = parent.child(index);
    const other = parent.child(target);
    let position = 0;
    for (let i = 0; i < Math.min(index, target); i += 1) position += parent.child(i).nodeSize;

    const tr = state.tr;
    const first = direction === "up" ? other : node;
    const second = direction === "up" ? node : other;
    tr.replaceWith(
      position,
      position + first.nodeSize + second.nodeSize,
      [second, first],
    );
    editor.view.dispatch(tr);
    editor.commands.focus();
  };

  const duplicateBlock = () => {
    const { state } = editor;
    const { $from } = state.selection;
    const node = $from.node(1);
    if (!node) return;
    const end = $from.after(1);
    editor.view.dispatch(state.tr.insert(end, node.copy(node.content)));
    editor.commands.focus();
  };

  const items = [
    {
      icon: Scissors,
      label: "Cut",
      run: () => document.execCommand("cut"),
    },
    {
      icon: ClipboardCopy,
      label: "Copy",
      run: () => document.execCommand("copy"),
    },
    {
      icon: ClipboardPaste,
      label: "Paste",
      run: async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) editor.chain().focus().insertContent(text).run();
        } catch {
          /* clipboard permission denied — use ⌘V */
        }
      },
    },
    "divider",
    { icon: Copy, label: "Duplicate block", run: duplicateBlock },
    { icon: MoveUp, label: "Move block up", run: () => moveBlock("up") },
    { icon: MoveDown, label: "Move block down", run: () => moveBlock("down") },
    "divider",
    {
      icon: Pilcrow,
      label: "Turn into paragraph",
      run: () => editor.chain().focus().setParagraph().run(),
    },
    {
      icon: Trash2,
      label: "Delete block",
      danger: true,
      run: () => {
        const { state } = editor;
        const { $from } = state.selection;
        try {
          const from = $from.before(1);
          const to = $from.after(1);
          editor.view.dispatch(state.tr.delete(from, to));
          editor.commands.focus();
        } catch {
          /* nothing to delete at this depth */
        }
      },
    },
  ];

  return (
    <div
      className="altft-context-menu"
      role="menu"
      aria-label="Editor context menu"
      style={{ left: menu.x, top: menu.y }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {items.map((item, index) =>
        item === "divider" ? (
          <span key={`div-${index}`} className="altft-context-menu__divider" aria-hidden="true" />
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className={`altft-context-menu__item ${item.danger ? "is-danger" : ""}`}
            onClick={() => {
              item.run();
              close();
            }}
          >
            <item.icon size={13} /> {item.label}
          </button>
        ),
      )}
    </div>
  );
}
