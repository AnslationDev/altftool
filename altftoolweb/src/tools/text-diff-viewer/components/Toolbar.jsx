"use client";

import { Button } from "@altftool/ui";
import {
  Columns2, AlignLeft, Undo2, Redo2, ArrowUpDown,
  Trash2, FileDown, Copy, Share2, Search, BarChart3,
  Settings, Maximize2, Save, Type,
} from "lucide-react";

const ICON_BTN =
  "flex min-h-11 min-w-11 sm:min-h-8 sm:min-w-8 items-center justify-center p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35";

export default function Toolbar({
  viewMode, setViewMode, diffMode, setDiffMode,
  ignoreSpaces, setIgnoreSpaces, ignoreCase, setIgnoreCase,
  onUndo, onRedo, canUndo, canRedo,
  onSwap, onClear, onExport, onCopy, onShare,
  onSearch, onAnalytics, onSettings, onFullscreen, onSave,
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-(--card) border border-(--border) rounded-xl">
      <div className="flex gap-0.5 bg-(--muted) rounded-lg p-0.5">
        <button
          onClick={() => setViewMode("side-by-side")}
          aria-label="Side by side view"
          aria-pressed={viewMode === "side-by-side"}
          className={`flex min-h-11 min-w-11 sm:min-h-8 sm:min-w-8 items-center justify-center p-1.5 rounded-md transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${viewMode === "side-by-side" ? "bg-(--card) shadow-sm text-(--primary)" : "text-(--muted-foreground)"}`}
          title="Side by side"
        >
          <Columns2 size="16" />
        </button>
        <button
          onClick={() => setViewMode("inline")}
          aria-label="Inline view"
          aria-pressed={viewMode === "inline"}
          className={`flex min-h-11 min-w-11 sm:min-h-8 sm:min-w-8 items-center justify-center p-1.5 rounded-md transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${viewMode === "inline" ? "bg-(--card) shadow-sm text-(--primary)" : "text-(--muted-foreground)"}`}
          title="Inline"
        >
          <AlignLeft size="16" />
        </button>
      </div>

      <div className="w-px h-6 bg-(--border)" />

      <select
        value={diffMode}
        onChange={(e) => setDiffMode(e.target.value)}
        aria-label="Diff mode"
        className="h-11 sm:h-8 px-2 text-xs rounded-lg border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
      >
        <option value="word">Word</option>
        <option value="line">Line</option>
        <option value="character">Character</option>
      </select>

      <div className="w-px h-6 bg-(--border)" />

      <button
        onClick={() => setIgnoreSpaces(!ignoreSpaces)}
        aria-label="Ignore spaces"
        aria-pressed={ignoreSpaces}
        className={`flex min-h-11 min-w-11 sm:min-h-8 sm:min-w-8 items-center justify-center p-1.5 rounded-lg text-xs font-medium transition border active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
          ignoreSpaces ? "bg-(--primary) text-(--primary-foreground) border-(--primary)" : "bg-(--card) text-(--muted-foreground) border-(--border)"
        }`}
        title="Ignore spaces"
      >
        <Type size="14" />
      </button>

      <button
        onClick={() => setIgnoreCase(!ignoreCase)}
        aria-label="Ignore case"
        aria-pressed={ignoreCase}
        className={`px-2 min-h-11 sm:min-h-8 h-auto rounded-lg text-xs font-medium transition border active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
          ignoreCase ? "bg-(--primary) text-(--primary-foreground) border-(--primary)" : "bg-(--card) text-(--muted-foreground) border-(--border)"
        }`}
        title="Ignore case"
      >
        Aa
      </button>

      <div className="w-px h-6 bg-(--border)" />

      <button onClick={onUndo} disabled={!canUndo} aria-label="Undo" className={`${ICON_BTN} disabled:opacity-30`} title="Undo"><Undo2 size="16" /></button>
      <button onClick={onRedo} disabled={!canRedo} aria-label="Redo" className={`${ICON_BTN} disabled:opacity-30`} title="Redo"><Redo2 size="16" /></button>
      <button onClick={onSwap} aria-label="Swap A and B" className={ICON_BTN} title="Swap A/B"><ArrowUpDown size="16" /></button>
      <button onClick={onClear} aria-label="Clear both texts" className={ICON_BTN} title="Clear"><Trash2 size="16" /></button>

      <div className="w-px h-6 bg-(--border)" />

      <button onClick={onSave} aria-label="Save version" className={ICON_BTN} title="Save"><Save size="16" /></button>
      <button onClick={onSearch} aria-label="Search in diff" className={ICON_BTN} title="Search"><Search size="16" /></button>
      <button onClick={onAnalytics} aria-label="Toggle analytics" className={ICON_BTN} title="Analytics"><BarChart3 size="16" /></button>
      <button onClick={onExport} aria-label="Export diff" className={ICON_BTN} title="Export"><FileDown size="16" /></button>
      <button onClick={onCopy} aria-label="Copy diff to clipboard" className={ICON_BTN} title="Copy diff"><Copy size="16" /></button>
      <button onClick={onShare} aria-label="Share diff link" className={ICON_BTN} title="Share"><Share2 size="16" /></button>

      <div className="w-px h-6 bg-(--border)" />

      <button onClick={onFullscreen} aria-label="Toggle fullscreen" className={ICON_BTN} title="Fullscreen"><Maximize2 size="16" /></button>
    </div>
  );
}
