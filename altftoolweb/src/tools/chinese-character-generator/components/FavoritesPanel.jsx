"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CharacterCard from "./CharacterCard";

// Favorites panel: list saved characters, remove individually, clear all.
export default function FavoritesPanel({ favorites, onRemove, onClear, onSelect, cardRefs }) {
  const handleClear = () => {
    if (favorites.length === 0) return;
    onClear();
    toast.success("Favorites cleared");
  };

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--border) bg-(--card) p-10 text-center shadow-sm">
        <Heart size={28} className="mx-auto mb-3 text-(--muted-foreground)" />
        <p className="text-sm text-(--muted-foreground)">
          No favorites yet. Tap “Save” on any character to keep it here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-lg font-semibold text-(--foreground)">
          Saved Favorites ({favorites.length})
        </h2>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm font-medium text-(--foreground) transition hover:bg-(--muted) active:scale-95"
        >
          <Trash2 size={16} />
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {favorites.map((item) => (
            <CharacterCard
              key={`${item.char}-${item.unicode}`}
              ref={(node) => {
                if (cardRefs) cardRefs.current[`${item.char}-${item.unicode}`] = node;
              }}
              item={item}
              favorite
              onToggleFavorite={onRemove}
              onSelect={onSelect}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
