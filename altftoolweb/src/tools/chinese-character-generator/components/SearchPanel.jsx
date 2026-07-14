"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shuffle, X } from "lucide-react";
import CategoryChips from "./CategoryChips";
import CharacterCard from "./CharacterCard";
import { CATEGORIES } from "../utils/characters";
import { filterCharacters, pickRandom } from "../utils/search";

// Search panel: free-text search + category filter + random results.
export default function SearchPanel({
  source,
  favorites,
  onToggleFavorite,
  onSelect,
  cardRefs,
  onResults,
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const results = filterCharacters(source, query, category);

  const handleRandom = () => {
    const pick = pickRandom(results);
    if (pick) onSelect(pick);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
        <h2 className="section-title text-lg font-semibold text-(--foreground)">
          Search Characters
        </h2>
        <p className="description mb-4 mt-1 text-sm text-(--muted-foreground)">
          Search by English meaning, pinyin, or the exact Chinese character.
        </p>

        <div className="relative mb-4">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. dragon, love, 福"
            className="w-full rounded-xl border border-(--border) bg-(--background) py-2.5 pl-9 pr-9 text-sm text-(--foreground) placeholder:text-(--muted-foreground) focus:border-(--primary) focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground) hover:text-(--foreground)"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <CategoryChips categories={CATEGORIES} value={category} onChange={setCategory} />

        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-(--muted-foreground)">
            {results.length} result{results.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={handleRandom}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm font-medium text-(--foreground) transition hover:bg-(--muted) active:scale-95"
          >
            <Shuffle size={16} />
            Random results
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((item, idx) => (
            <CharacterCard
              key={`${item.char}-${item.unicode}-${idx}`}
              ref={(node) => {
                if (cardRefs) cardRefs.current[`${item.char}-${item.unicode}`] = node;
              }}
              item={item}
              favorite={favorites.some(
                (f) => f.char === item.char && f.unicode === item.unicode
              )}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelect}
            />
          ))}
        </AnimatePresence>
      </div>

      {results.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-(--muted-foreground)"
        >
          No characters match your search.
        </motion.p>
      )}
    </div>
  );
}
