"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Command, Search } from "lucide-react";
import { useAltfEditor } from "./EditorProvider.jsx";
import { getPaletteCommands } from "./EditorCommands.js";

/**
 * EditorCommandPalette — ⌘K / Ctrl+K searchable command runner over the
 * shared registry. Same list the slash menu uses; future AI actions land
 * here automatically once registered.
 */
export default function EditorCommandPalette({ open, onClose }) {
  const { editor } = useAltfEditor();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const items = useMemo(() => {
    const q = query.toLowerCase().trim();
    const all = getPaletteCommands();
    if (!q) return all;
    return all.filter(
      (item) =>
        String(item.label || "").toLowerCase().includes(q) ||
        (item.keywords || []).some((keyword) => keyword.includes(q)),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    setQuery("");
    setSelectedIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 30);

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => setSelectedIndex(0), [items]);

  if (!open || !editor) return null;

  function runItem(item) {
    onClose();
    window.setTimeout(() => item.run(editor), 10);
  }

  function onKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) => (index + 1) % Math.max(items.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => (index - 1 + items.length) % Math.max(items.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (items[selectedIndex]) runItem(items[selectedIndex]);
    } else if (event.key === "Escape") {
      onClose();
    }
  }

  return (
    <div className="altft-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="altft-palette"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="altft-palette__search">
          <Search size={15} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Search commands…"
            aria-label="Search commands"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd>
            <Command size={10} /> K
          </kbd>
        </div>
        <div className="altft-palette__list" role="listbox">
          {items.length === 0 && <p className="altft-palette__empty">No commands found</p>}
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                className={`altft-palette__item ${index === selectedIndex ? "is-selected" : ""}`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => runItem(item)}
              >
                <Icon size={15} aria-hidden="true" />
                <span>
                  <strong>{item.label}</strong>
                  <em>{item.description}</em>
                </span>
                <small>{item.group}</small>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
