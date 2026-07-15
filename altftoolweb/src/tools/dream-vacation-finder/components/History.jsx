"use client";

import { Clock, MapPin, Trash2, RotateCcw } from "lucide-react";

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function History({ history, onClear, onUse, onRemove }) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-10 text-center shadow-md">
        <Clock className="w-10 h-10 text-(--muted-foreground) mx-auto mb-3" />
        <p className="text-(--muted-foreground) font-medium">No saved destinations</p>
        <p className="text-sm text-(--muted-foreground) mt-1">
          Find your dream vacation and save destinations here.
        </p>
      </div>
    );
  }

  const saved = history.filter((h) => h.saved);
  const recent = history.filter((h) => !h.saved);

  const renderItem = (entry) => (
    <div
      key={entry.id || entry.name}
      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-(--page) border border-(--border) hover:border-(--primary)/30 transition group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <MapPin className="w-3.5 h-3.5 text-(--primary)" />
          <span className="text-sm font-semibold">{entry.name}</span>
          <span className="text-xs text-(--muted-foreground)">{entry.country}</span>
        </div>
        <p className="text-xs text-(--muted-foreground) truncate">
          {entry.continent} · {entry.bestTime} · {entry.match || entry.score ? `${Math.round((entry.match || entry.score || 0.5) * 100)}% match` : ""}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => onUse(entry)}
          className="p-1.5 rounded-lg hover:bg-(--primary)/10 transition"
          title="View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-(--muted-foreground)" />
        </button>
        <button
          onClick={() => onRemove(entry.id || entry.name)}
          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
          title="Remove"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-(--muted-foreground) uppercase tracking-wide flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Destinations ({history.length})
        </h3>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-(--border) hover:text-red-500 hover:border-red-300 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {saved.length > 0 && (
          <>
            <p className="text-xs font-medium text-(--muted-foreground) px-1 pt-1 pb-1">Saved</p>
            {saved.map(renderItem)}
          </>
        )}
        {recent.length > 0 && (
          <>
            {saved.length > 0 && <div className="border-t border-(--border) my-2" />}
            <p className="text-xs font-medium text-(--muted-foreground) px-1 pt-1 pb-1">Recent</p>
            {recent.map(renderItem)}
          </>
        )}
      </div>
    </div>
  );
}
