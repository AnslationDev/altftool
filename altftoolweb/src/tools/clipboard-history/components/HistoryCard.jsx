"use client";

import React from "react";
import {
  Link, Mail, Code, Braces, Hash, Palette, Type,
  Star, Trash2, Copy, MoreVertical, Clock,
} from "lucide-react";
import { Badge } from "@altftool/ui";
import { formatTimestamp } from "../utils/historyDb";

const TYPE_ICONS = {
  url: Link,
  email: Mail,
  code: Code,
  json: Braces,
  number: Hash,
  color: Palette,
  text: Type,
};

const TYPE_COLORS = {
  url: "text-blue-500",
  email: "text-purple-500",
  code: "text-orange-500",
  json: "text-green-500",
  number: "text-teal-500",
  color: "text-pink-500",
  text: "text-[var(--muted-foreground)]",
};

const TYPE_BG = {
  url: "bg-blue-50 dark:bg-blue-950/20",
  email: "bg-purple-50 dark:bg-purple-950/20",
  code: "bg-orange-50 dark:bg-orange-950/20",
  json: "bg-green-50 dark:bg-green-950/20",
  number: "bg-teal-50 dark:bg-teal-950/20",
  color: "bg-pink-50 dark:bg-pink-950/20",
  text: "bg-[var(--muted)]/50",
};

export default function HistoryCard({ entry, onDelete, onToggleFavorite, onCopy }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const menuTriggerRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const IconComponent = TYPE_ICONS[entry.type] || Type;
  const iconColor = TYPE_COLORS[entry.type] || TYPE_COLORS.text;
  const bgColor = TYPE_BG[entry.type] || TYPE_BG.text;

  const isColor = entry.type === "color";
  const isUrl = entry.type === "url";

  return (
    <div className="group relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all hover:shadow-md hover:border-[var(--primary)]/30">
      {/* Top strip with type color */}
      <div className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 ${bgColor}`}>
        <IconComponent size={14} className={iconColor} />
        <span className={`text-xs font-semibold uppercase tracking-wide ${iconColor}`}>{entry.type}</span>
        {isColor && (
          <span
            className="ml-1 h-4 w-4 rounded-full border border-white/50 shadow-sm"
            style={{ backgroundColor: entry.content }}
          />
        )}
        <div className="ml-auto flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Clock size={11} />
          <span>{formatTimestamp(entry.timestamp)}</span>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-4">
        {isUrl ? (
          <a
            href={entry.content}
            target="_blank"
            rel="noopener noreferrer"
            className="line-clamp-2 break-all text-sm font-medium text-[var(--primary)] hover:underline"
          >
            {entry.content}
          </a>
        ) : (
          <pre className="line-clamp-3 whitespace-pre-wrap break-all font-mono text-sm text-[var(--foreground)]">
            {entry.content}
          </pre>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2.5">
        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
          <span>{entry.charCount.toLocaleString()} chars</span>
          {entry.type === "text" || entry.type === "code" ? (
            <span>{entry.wordCount} words</span>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          {/* Copy button */}
          <button
            onClick={() => onCopy(entry.content)}
            className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            title="Copy to clipboard"
          >
            <Copy size={15} />
          </button>

          {/* Favorite */}
          <button
            onClick={() => onToggleFavorite(entry.id)}
            className={`rounded-md p-1.5 transition-colors ${entry.isFavorite ? "text-amber-500" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}
            title={entry.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={15} className={entry.isFavorite ? "fill-current" : ""} />
          </button>

          {/* Menu */}
          <div
            className="relative"
            ref={menuRef}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setMenuOpen(false);
                menuTriggerRef.current?.focus();
              }
            }}
          >
            <button
              ref={menuTriggerRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="More actions"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 bottom-full z-10 mb-1 w-40 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
                <button
                  role="menuitem"
                  onClick={() => { onCopy(entry.content); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  <Copy size={13} /> Copy
                </button>
                <div className="my-1 h-px bg-[var(--border)]" />
                <button
                  role="menuitem"
                  onClick={() => { onDelete(entry.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
