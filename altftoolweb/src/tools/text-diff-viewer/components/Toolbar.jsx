import { Button } from "@altftool/ui";
import {
  Columns2, AlignLeft, Undo2, Redo2, ArrowUpDown,
  Trash2, FileDown, Copy, Share2, Search, BarChart3,
  Settings, Maximize2, Save, Type,
} from "lucide-react";

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
          className={`p-1.5 rounded-md transition ${viewMode === "side-by-side" ? "bg-(--card) shadow-sm text-(--primary)" : "text-(--muted-foreground)"}`}
          title="Side by side"
        >
          <Columns2 size="16" />
        </button>
        <button
          onClick={() => setViewMode("inline")}
          className={`p-1.5 rounded-md transition ${viewMode === "inline" ? "bg-(--card) shadow-sm text-(--primary)" : "text-(--muted-foreground)"}`}
          title="Inline"
        >
          <AlignLeft size="16" />
        </button>
      </div>

      <div className="w-px h-6 bg-(--border)" />

      <select
        value={diffMode}
        onChange={(e) => setDiffMode(e.target.value)}
        className="h-8 px-2 text-xs rounded-lg border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
      >
        <option value="word">Word</option>
        <option value="line">Line</option>
        <option value="character">Character</option>
      </select>

      <div className="w-px h-6 bg-(--border)" />

      <button
        onClick={() => setIgnoreSpaces(!ignoreSpaces)}
        className={`p-1.5 rounded-lg text-xs font-medium transition border ${
          ignoreSpaces ? "bg-(--primary) text-(--primary-foreground) border-(--primary)" : "bg-(--card) text-(--muted-foreground) border-(--border)"
        }`}
        title="Ignore spaces"
      >
        <Type size="14" />
      </button>

      <button
        onClick={() => setIgnoreCase(!ignoreCase)}
        className={`px-2 h-8 rounded-lg text-xs font-medium transition border ${
          ignoreCase ? "bg-(--primary) text-(--primary-foreground) border-(--primary)" : "bg-(--card) text-(--muted-foreground) border-(--border)"
        }`}
        title="Ignore case"
      >
        Aa
      </button>

      <div className="w-px h-6 bg-(--border)" />

      <button onClick={onUndo} disabled={!canUndo} className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) disabled:opacity-30 transition"><Undo2 size="16" /></button>
      <button onClick={onRedo} disabled={!canRedo} className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) disabled:opacity-30 transition"><Redo2 size="16" /></button>
      <button onClick={onSwap} className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition" title="Swap A/B"><ArrowUpDown size="16" /></button>
      <button onClick={onClear} className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition" title="Clear"><Trash2 size="16" /></button>

      <div className="w-px h-6 bg-(--border)" />

      <button onClick={onSave} className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition" title="Save"><Save size="16" /></button>
      <button onClick={onSearch} className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition" title="Search"><Search size="16" /></button>
      <button onClick={onAnalytics} className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition" title="Analytics"><BarChart3 size="16" /></button>
      <button onClick={onExport} className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition" title="Export"><FileDown size="16" /></button>
      <button onClick={onCopy} className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition" title="Copy diff"><Copy size="16" /></button>
      <button onClick={onShare} className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition" title="Share"><Share2 size="16" /></button>

      <div className="w-px h-6 bg-(--border)" />

      <button onClick={onFullscreen} className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition" title="Fullscreen"><Maximize2 size="16" /></button>
    </div>
  );
}
