"use client";

import React, { useState } from "react";
import { X, Heart, Trash2, Download, Copy } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { formatJokeText, downloadJokesAsTxt } from "../utils/exportUtils";

export default function FavoritesPanel({ favorites, onClose, onRemove, onSelect }) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const filtered = favorites.filter((f) =>
    !search || f.joke.toLowerCase().includes(search.toLowerCase()) ||
    (f.category && f.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCopy = async (joke) => {
    const ok = await safeCopyText(formatJokeText(joke));
    if (ok) {
      setCopiedId(joke.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-xl border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-lg)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-(--border)">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-rose-500" fill="currentColor" />
            <h2 className="text-base font-semibold text-(--foreground)">Favorites</h2>
            <span className="text-xs font-semibold text-(--muted-foreground)">({favorites.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {favorites.length > 0 && (
              <button
                onClick={() => downloadJokesAsTxt(favorites, "favorite-jokes.txt")}
                className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition-colors"
                aria-label="Download all favorites"
              >
                <Download size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition-colors"
              aria-label="Close favorites panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search favorites..."
            aria-label="Search favorites"
            className="w-full input px-3 py-2 text-sm"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-(--muted-foreground)">
                {favorites.length === 0 ? "No favorites yet." : "No matching favorites."}
              </p>
            </div>
          ) : (
            filtered.map((joke) => (
              <div
                key={joke.id}
                className="rounded-lg border border-(--border) bg-(--background) p-3 cursor-pointer hover:border-(--primary) transition-colors"
                onClick={() => { onSelect(joke); onClose(); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") { onSelect(joke); onClose(); } }}
              >
                <p className="text-sm font-medium text-(--foreground) leading-relaxed mb-2">
                  {joke.joke}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-(--muted-foreground)">
                    {joke.category && <span className="rounded-full bg-(--muted) px-2 py-0.5">{joke.category}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(joke); }}
                      className="p-1 rounded hover:bg-(--muted) text-(--muted-foreground)"
                      aria-label="Copy joke"
                    >
                      {copiedId === joke.id ? (
                        <span className="text-xs text-green-600 font-semibold">Copied</span>
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(joke.id); }}
                      className="p-1 rounded hover:bg-red-100 text-(--muted-foreground) hover:text-red-600"
                      aria-label="Remove from favorites"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
