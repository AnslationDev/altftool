"use client";

import { Copy, Download, Search } from "lucide-react";

export default function EditorPanel({
  title,
  value,
  onChange,
  readOnly = false,
  placeholder = "",
  search = "",
  onSearch,
  onCopy,
  onDownload,
}) {
  const highlighted = search ? countMatches(value, search) : 0;

  return (
    <section className="min-w-0 overflow-hidden rounded-3xl cf-glass cf-neon">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-(--border)">
        <div>
          <h2 className="text-lg font-bold text-(--foreground)">{title}</h2>
          {search && <p className="text-xs text-(--secondary)">Matches: {highlighted}</p>}
        </div>
        <div className="flex items-center gap-2">
          {onSearch && (
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-(--border) bg-(--muted)/25 text-sm min-w-0">
              <Search className="w-4 h-4 text-(--secondary)" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Find"
                className="bg-transparent outline-none w-24 text-(--foreground) placeholder:text-(--secondary)"
              />
            </label>
          )}
          {onCopy && (
            <button onClick={onCopy} className="btn-secondary px-3 py-2 flex items-center gap-2 cursor-pointer">
              <Copy className="w-4 h-4" />
              Copy
            </button>
          )}
          {onDownload && (
            <button onClick={onDownload} className="btn-primary px-3 py-2 flex items-center gap-2 cursor-pointer">
              <Download className="w-4 h-4" />
              CSS
            </button>
          )}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        placeholder={placeholder}
        className="cf-code-input"
      />
    </section>
  );
}

function countMatches(value, search) {
  if (!search) return 0;
  return (value.match(new RegExp(escapeRegExp(search), "gi")) || []).length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
