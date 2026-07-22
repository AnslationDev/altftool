"use client";

import { useState } from "react";
import { Star, Clock3, Trash2 } from "lucide-react";
import Card from "./ui/Card";
import { TONE_CLASSES, toneForGrade } from "../lib/uiTone";

function EntryRow({ entry, isFav, onSelect, onToggleFavorite }) {
  const tone = TONE_CLASSES[toneForGrade(entry.grade)];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--background) p-3">
      <button type="button" onClick={() => onSelect(entry.subject)} className="min-w-0 flex-1 cursor-pointer text-left">
        <p className="truncate text-sm font-medium text-(--foreground)">{entry.subject}</p>
        <p className="text-xs text-(--muted-foreground)">{new Date(entry.ts).toLocaleString()}</p>
      </button>
      <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${tone.soft} ${tone.text}`}>
        {entry.grade} · {entry.overall}
      </span>
      <button
        type="button"
        onClick={() => onToggleFavorite(entry)}
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={isFav}
        className="shrink-0 cursor-pointer text-(--muted-foreground) transition-colors hover:text-warning"
      >
        <Star className={`h-4 w-4 ${isFav ? "fill-warning text-warning" : ""}`} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function HistoryFavorites({ history, favorites, onSelect, onToggleFavorite, onClearHistory }) {
  const [tab, setTab] = useState("recent");
  const favoriteSubjects = new Set(favorites.map((f) => f.subject));
  const list = tab === "recent" ? history : favorites;

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("recent")}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "recent" ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"
            }`}
          >
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Recent ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("favorites")}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "favorites" ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"
            }`}
          >
            <Star className="h-3.5 w-3.5" aria-hidden="true" /> Favorites ({favorites.length})
          </button>
        </div>
        {tab === "recent" && history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-(--muted-foreground) hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-(--muted-foreground)">
          {tab === "recent" ? "Analyzed subjects will show up here." : "Star an analysis to save it here permanently."}
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              isFav={favoriteSubjects.has(entry.subject)}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
