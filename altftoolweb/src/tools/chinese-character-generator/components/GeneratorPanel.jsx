"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Layers, Minus, Plus } from "lucide-react";
import CategoryChips from "./CategoryChips";
import CharacterCard from "./CharacterCard";
import { CATEGORIES } from "../utils/characters";
import { pickRandom, pickMultiple } from "../utils/search";

// Generator panel: pick a category, generate random / multiple characters.
export default function GeneratorPanel({
  items,
  favorites,
  onToggleFavorite,
  onSelect,
  cardRefs,
}) {
  const [category, setCategory] = useState("All");
  const [count, setCount] = useState(5);

  const pool = () =>
    category === "All"
      ? items
      : items.filter((i) => i.category === category);

  const handleRandom = () => {
    const pick = pickRandom(pool());
    if (pick) onSelect(pick);
  };

  const handleMultiple = () => {
    const picks = pickMultiple(pool(), count);
    if (picks.length) onSelect(picks);
  };

  const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-semibold text-(--primary-foreground) transition hover:opacity-90 active:scale-95";
  const btnGhost =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm font-medium text-(--foreground) transition hover:bg-(--muted) active:scale-95";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
        <h2 className="section-title text-lg font-semibold text-(--foreground)">
          Generate Characters
        </h2>
        <p className="description mb-4 mt-1 text-sm text-(--muted-foreground)">
          Choose a category, then generate authentic Chinese characters with
          meanings, pinyin, and stroke data.
        </p>

        <CategoryChips categories={CATEGORIES} value={category} onChange={setCategory} />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleRandom} className={btnGhost}>
            <Shuffle size={16} />
            Random Generate
          </button>
          <button type="button" onClick={handleMultiple} className={btnPrimary}>
            <Layers size={16} />
            Generate {count}
          </button>

          <div className="ml-auto flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-1.5">
            <span className="text-sm text-(--muted-foreground)">Count</span>
            <button
              type="button"
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-(--border) hover:bg-(--muted) active:scale-95"
              aria-label="Decrease count"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-sm font-semibold text-(--foreground)">
              {count}
            </span>
            <button
              type="button"
              onClick={() => setCount((c) => Math.min(10, c + 1))}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-(--border) hover:bg-(--muted) active:scale-95"
              aria-label="Increase count"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {Array.isArray(items) &&
            items.map((item, idx) => (
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

      {(!items || items.length === 0) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-(--muted-foreground)"
        >
          No characters selected yet. Generate some above.
        </motion.p>
      )}
    </div>
  );
}
